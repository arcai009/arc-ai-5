import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type LanguageModel,
  type UIMessage,
} from "ai";
import type { Sandbox } from "e2b";
import { db } from "@/lib/db";
import type { SandboxSession } from "@/app/generated/prisma/client";
import { DEFAULT_MODEL_ID, getModel, isModelConfigured } from "@/lib/models";
import { getMessageText, serializeStepContent } from "@/lib/chat-utils";
import { creditsForTokens, getBalanceInTx, RESERVE_TOKENS, reservationAmount } from "@/lib/credits";
import { checkMessageLimit } from "@/lib/message-limits";
import {
  connectSandbox,
  createSandbox,
  endSandboxSession,
  isE2BConfigured,
  SANDBOX_MAX_DURATION_MS,
  sandboxReservationAmount,
} from "@/lib/sandbox";
import { createAgentTools, createLocalAgentTools } from "@/lib/agent-tools";

function resolveLanguageModel(modelId: string, provider: string): LanguageModel {
  if (provider === "anthropic") return anthropic(modelId);
  if (provider === "google") return google(modelId);
  return openai(modelId);
}

async function ensureSandboxSession(
  conversationId: string,
  userId: string,
  existing: SandboxSession | null,
): Promise<{ sandbox: Sandbox } | { error: string; status: number }> {
  if (existing && !existing.endedAt) {
    const expiresAt = existing.startedAt.getTime() + SANDBOX_MAX_DURATION_MS;
    if (Date.now() < expiresAt && existing.externalId) {
      const sandbox = await connectSandbox(existing.externalId);
      return { sandbox };
    }
    // Past its time cap — reconcile and fall through to start a fresh one.
    await endSandboxSession(existing);
  }

  const reserveAmount = sandboxReservationAmount();
  let insufficientCredits = false;
  let sessionId: string | null = null;

  await db.$transaction(async (tx) => {
    const balance = await getBalanceInTx(tx, userId);
    if (balance < reserveAmount) {
      insufficientCredits = true;
      return;
    }

    // Free up the 1:1 slot if the previous (now-ended) session still holds it.
    if (existing) {
      await tx.sandboxSession.update({
        where: { id: existing.id },
        data: { conversationId: null },
      });
    }

    await tx.creditLedger.create({
      data: { userId, delta: -reserveAmount, reason: "sandbox_reserve" },
    });

    const session = await tx.sandboxSession.create({
      data: { userId, conversationId },
    });
    sessionId = session.id;
  });

  if (insufficientCredits) {
    return {
      error: "You're out of credits for a sandbox session. Upgrade or top up to continue — coming soon.",
      status: 402,
    };
  }

  const sandbox = await createSandbox();
  await db.sandboxSession.update({
    where: { id: sessionId! },
    data: { externalId: sandbox.sandboxId },
  });

  return { sandbox };
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json(
      { error: "Account is still being set up, try again shortly." },
      { status: 400 },
    );
  }

  const body = (await req.json()) as {
    messages: UIMessage[];
    modelId?: string;
    conversationId?: string;
  };
  const { messages, modelId = DEFAULT_MODEL_ID, conversationId } = body;

  const model = getModel(modelId);
  if (!model) {
    return NextResponse.json({ error: "Unknown model" }, { status: 400 });
  }

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, userId: user.id, mode: "AGENT" },
    include: { sandboxSession: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const limit = await checkMessageLimit(user.id, user.email);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `The free plan is limited to ${limit.limit} messages. Upgrade to Pro to keep chatting.`,
      },
      { status: 403 },
    );
  }

  const llmReserveAmount = reservationAmount(model);
  let llmReservationId: string | null = null;
  let insufficientLlmCredits = false;

  await db.$transaction(async (tx) => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      const existingCount = await tx.message.count({
        where: { conversationId: conversation.id },
      });

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          role: "USER",
          content: getMessageText(lastMessage),
        },
      });

      if (existingCount === 0) {
        await tx.conversation.update({
          where: { id: conversation.id },
          data: { title: getMessageText(lastMessage).slice(0, 40) || "New agent session" },
        });
      }
    }

    if (!isModelConfigured(model)) return;

    const balance = await getBalanceInTx(tx, user.id);
    if (balance < llmReserveAmount) {
      insufficientLlmCredits = true;
      return;
    }

    const reservation = await tx.creditLedger.create({
      data: { userId: user.id, delta: -llmReserveAmount, reason: "agent_llm_reserve" },
    });
    llmReservationId = reservation.id;
  });

  if (!isModelConfigured(model)) {
    return NextResponse.json(
      { error: `${model.label} isn't configured yet — missing ${model.envKey}.` },
      { status: 400 },
    );
  }

  if (insufficientLlmCredits) {
    return NextResponse.json(
      { error: "You're out of credits. Upgrade or top up to continue — coming soon." },
      { status: 402 },
    );
  }

  const isLocal = conversation.executionMode === "LOCAL";
  let tools: ReturnType<typeof createAgentTools> | ReturnType<typeof createLocalAgentTools>;

  if (isLocal) {
    // Local sessions run tools on the user's own machine via the desktop app's
    // permission-gated bridge — no cloud sandbox to provision or pay for here.
    tools = createLocalAgentTools();
  } else {
    if (!isE2BConfigured()) {
      // We already reserved LLM credits above — refund since we can't proceed.
      await db.creditLedger.create({
        data: {
          userId: user.id,
          delta: llmReserveAmount,
          reason: "agent_llm_refund",
          relatedCallId: llmReservationId,
        },
      });
      return NextResponse.json(
        { error: "The coding sandbox isn't configured yet — missing E2B_API_KEY." },
        { status: 400 },
      );
    }

    const sandboxResult = await ensureSandboxSession(
      conversation.id,
      user.id,
      conversation.sandboxSession,
    );

    if ("error" in sandboxResult) {
      await db.creditLedger.create({
        data: {
          userId: user.id,
          delta: llmReserveAmount,
          reason: "agent_llm_refund",
          relatedCallId: llmReservationId,
        },
      });
      return NextResponse.json({ error: sandboxResult.error }, { status: sandboxResult.status });
    }

    tools = createAgentTools(sandboxResult.sandbox);
  }

  const callId = llmReservationId;

  const result = streamText({
    model: resolveLanguageModel(model.id, model.provider),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(20),
    onFinish: async (event) => {
      const actualCost = creditsForTokens(model, event.totalUsage?.totalTokens ?? RESERVE_TOKENS);
      await db.$transaction(async (tx) => {
        await tx.creditLedger.create({
          data: {
            userId: user.id,
            delta: llmReserveAmount - actualCost,
            reason: "agent_llm_reconcile",
            relatedCallId: callId,
          },
        });
        await tx.message.create({
          data: {
            conversationId: conversation.id,
            role: "ASSISTANT",
            content: serializeStepContent(event.content),
            modelUsed: model.id,
            tokenCount: event.totalUsage?.totalTokens ?? null,
          },
        });
      });
    },
    onError: async () => {
      await db.creditLedger.create({
        data: {
          userId: user.id,
          delta: llmReserveAmount,
          reason: "agent_llm_refund",
          relatedCallId: callId,
        },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  type LanguageModel,
  type UIMessage,
} from "ai";
import { db } from "@/lib/db";
import { DEFAULT_MODEL_ID, getModel, isModelConfigured } from "@/lib/models";
import { getMessageText } from "@/lib/chat-utils";
import { creditsForTokens, getBalanceInTx, RESERVE_TOKENS, reservationAmount } from "@/lib/credits";

function resolveLanguageModel(modelId: string, provider: string): LanguageModel {
  return provider === "anthropic" ? anthropic(modelId) : openai(modelId);
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
    where: { id: conversationId, userId: user.id },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const reserveAmount = reservationAmount(model);
  let reservationId: string | null = null;
  let insufficientCredits = false;

  // Persist the user's message and reserve credits for the call in one
  // transaction, so a crash between the two can't grant free usage and the
  // message is never lost even if the call itself is rejected below.
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
          data: { title: getMessageText(lastMessage).slice(0, 40) || "New conversation" },
        });
      }
    }

    if (!isModelConfigured(model)) return;

    const balance = await getBalanceInTx(tx, user.id);
    if (balance < reserveAmount) {
      insufficientCredits = true;
      return;
    }

    const reservation = await tx.creditLedger.create({
      data: { userId: user.id, delta: -reserveAmount, reason: "llm_call_reserve" },
    });
    reservationId = reservation.id;
  });

  if (!isModelConfigured(model)) {
    return NextResponse.json(
      { error: `${model.label} isn't configured yet — missing ${model.envKey}.` },
      { status: 400 },
    );
  }

  if (insufficientCredits) {
    return NextResponse.json(
      { error: "You're out of credits. Upgrade or top up to continue — coming soon." },
      { status: 402 },
    );
  }

  const callId = reservationId;

  const result = streamText({
    model: resolveLanguageModel(model.id, model.provider),
    messages: await convertToModelMessages(messages),
    onFinish: async (event) => {
      const actualCost = creditsForTokens(model, event.totalUsage?.totalTokens ?? RESERVE_TOKENS);
      await db.$transaction(async (tx) => {
        await tx.creditLedger.create({
          data: {
            userId: user.id,
            delta: reserveAmount - actualCost,
            reason: "llm_call_reconcile",
            relatedCallId: callId,
          },
        });
        await tx.message.create({
          data: {
            conversationId: conversation.id,
            role: "ASSISTANT",
            content: event.text,
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
          delta: reserveAmount,
          reason: "llm_call_refund",
          relatedCallId: callId,
        },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}

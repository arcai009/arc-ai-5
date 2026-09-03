import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  type LanguageModel,
  type UIMessage,
} from "ai";
import { MODELS, isModelConfigured } from "@/lib/models";

/** Anonymous visitors get this many free answers on the landing page before signing up. */
export const TRY_LIMIT = 3;
const COOKIE = "arc_try_used";

function resolveLanguageModel(modelId: string, provider: string): LanguageModel {
  if (provider === "anthropic") return anthropic(modelId);
  if (provider === "google") return google(modelId);
  return openai(modelId);
}

function readUsed(req: Request): number {
  const raw = req.headers.get("cookie") ?? "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=(\\d+)`));
  const n = match ? Number(match[1]) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function setUsedCookie(n: number): string {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  return `${COOKIE}=${n}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

export async function POST(req: Request) {
  const used = readUsed(req);
  if (used >= TRY_LIMIT) {
    return NextResponse.json(
      {
        error: `You've used your ${TRY_LIMIT} free messages. Sign up free to keep chatting.`,
        limitReached: true,
      },
      { status: 403 },
    );
  }

  // Use the first model that actually has an API key configured (prod = Gemini).
  const model = MODELS.find(isModelConfigured);
  if (!model) {
    return NextResponse.json(
      { error: "The demo isn't available right now — please sign up to chat." },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { messages: UIMessage[] };
  const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];

  const result = streamText({
    model: resolveLanguageModel(model.id, model.provider),
    system:
      "You are Arc AI, a friendly, concise assistant on the arcai.io landing page. " +
      "Give genuinely helpful, correct answers so the visitor sees the product works. " +
      "Keep replies fairly short.",
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 700,
  });

  return result.toUIMessageStreamResponse({
    headers: { "Set-Cookie": setUsedCookie(used + 1) },
  });
}

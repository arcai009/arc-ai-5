"use client";

import Link from "next/link";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageContent } from "@/components/chat/MessageContent";
import { getMessageText } from "@/lib/chat-utils";

/** Kept for the post-sign-up prompt hand-off (PendingPromptStarter still reads it). */
export const PENDING_PROMPT_KEY = "arc_pending_prompt";

/** Anonymous visitors get this many free answers before the upgrade prompt. */
const FREE_TRIES = 3;

const SUGGESTIONS = [
  "Explain a tricky bug in my code",
  "Draft a product launch email",
  "Write a script to rename files",
];

function isLimitError(error: Error | undefined): boolean {
  if (!error) return false;
  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.limitReached) return true;
    if (typeof parsed?.error === "string" && parsed.error.includes("free messages")) return true;
  } catch {
    // not JSON
  }
  return /free messages/i.test(error.message);
}

export function LandingComposer() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/try" }),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const answers = messages.filter((m) => m.role === "assistant").length;
  const limitReached = answers >= FREE_TRIES || isLimitError(error);
  const started = messages.length > 0;

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy || limitReached) return;
    setInput("");
    sendMessage({ text: trimmed });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="relative w-full max-w-2xl">
      {started && (
        <div className="mb-3 flex max-h-[46vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-black/10 bg-white/60 p-4 text-left dark:border-white/15 dark:bg-white/[0.03]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-[var(--accent-solid)] text-white"
                  : "mr-auto bg-black/5 dark:bg-white/10"
              }`}
            >
              <MessageContent content={getMessageText(m)} />
            </div>
          ))}
          {status === "submitted" && (
            <div className="mr-auto flex items-center gap-1 rounded-lg bg-black/5 px-4 py-3 dark:bg-white/10">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-1)] [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-2)] [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-3)]" />
            </div>
          )}
        </div>
      )}

      {limitReached ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--accent-solid)] bg-white/70 p-6 text-center dark:bg-white/[0.04]">
          <p className="text-base font-medium">That&rsquo;s your {FREE_TRIES} free messages 🎉</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign up free to keep chatting, or go Pro for unlimited messages and every model.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up" className="btn-accent rounded-full px-5 py-2.5 text-sm font-medium">
              Sign up free →
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              See pricing
            </Link>
          </div>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/[0.04]"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask Arc AI anything…"
              rows={started ? 1 : 2}
              disabled={isBusy}
              className="w-full resize-none bg-transparent px-1 text-base outline-none placeholder:text-gray-400 disabled:opacity-60 dark:placeholder:text-gray-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {FREE_TRIES - answers} free {FREE_TRIES - answers === 1 ? "message" : "messages"} left
              </span>
              <button
                type="submit"
                disabled={isBusy || !input.trim()}
                aria-label="Send message"
                className="btn-accent flex h-9 w-9 items-center justify-center rounded-full text-base disabled:opacity-40"
              >
                ↑
              </button>
            </div>
          </form>

          {!started && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

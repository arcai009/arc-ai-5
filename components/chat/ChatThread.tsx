"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { autosendKey } from "@/components/chat/PendingPromptStarter";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MessageContent } from "@/components/chat/MessageContent";
import { ModelPicker } from "@/components/chat/ModelPicker";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import { getMessageText } from "@/lib/chat-utils";

function extractErrorMessage(error: Error): string {
  try {
    const parsed = JSON.parse(error.message);
    if (parsed && typeof parsed.error === "string") return parsed.error;
  } catch {
    // not JSON, fall through to raw message
  }
  return error.message || "Something went wrong. Please try again.";
}

export function ChatThread({
  conversationId,
  initialMessages,
  outOfCredits,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  outOfCredits: boolean;
}) {
  const router = useRouter();
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ conversationId, modelId }),
    }),
    onFinish: () => router.refresh(),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const isThinking = status === "submitted";
  const disabled = isBusy || outOfCredits;

  // Auto-send a prompt carried over from the landing page composer, once.
  const autosent = useRef(false);
  useEffect(() => {
    if (autosent.current || outOfCredits) return;
    let pending: string | null = null;
    try {
      pending = localStorage.getItem(autosendKey(conversationId));
    } catch {
      return;
    }
    if (!pending) return;
    autosent.current = true;
    try {
      localStorage.removeItem(autosendKey(conversationId));
    } catch {
      // ignore
    }
    sendMessage({ text: pending });
  }, [conversationId, outOfCredits, sendMessage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
        <ModelPicker value={modelId} onChange={setModelId} disabled={isBusy} />
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send a message to start the conversation.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-2xl rounded-lg bg-black/5 px-4 py-3 text-sm dark:bg-white/10 ${
              message.role === "user" ? "ml-auto" : "mr-auto"
            }`}
          >
            <MessageContent content={getMessageText(message)} />
          </div>
        ))}
        {isThinking && (
          <div className="mr-auto flex items-center gap-1 rounded-lg bg-black/5 px-4 py-3 dark:bg-white/10">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-1)] [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-2)] [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-3)]" />
          </div>
        )}
        {error && (
          <div className="mr-auto max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {extractErrorMessage(error)}
          </div>
        )}
      </div>

      {outOfCredits ? (
        <div className="border-t border-black/10 p-4 text-center text-sm text-gray-500 dark:border-white/15 dark:text-gray-400">
          You&rsquo;re out of credits. Upgrade or top up to continue — coming soon.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-black/10 p-4 dark:border-white/15"
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
            placeholder="Message arc ai..."
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50 dark:border-white/15"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="btn-accent rounded-md px-4 py-2 text-sm font-medium"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

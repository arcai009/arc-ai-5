"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MessageContent } from "@/components/chat/MessageContent";
import { ModelPicker } from "@/components/chat/ModelPicker";
import { ToolCallBlock } from "@/components/agent/ToolCallBlock";
import { ToolPermissionPrompt, isLocalToolName } from "@/components/agent/ToolPermissionPrompt";
import { DEFAULT_MODEL_ID } from "@/lib/models";

function extractErrorMessage(error: Error): string {
  try {
    const parsed = JSON.parse(error.message);
    if (parsed && typeof parsed.error === "string") return parsed.error;
  } catch {
    // not JSON, fall through to raw message
  }
  return error.message || "Something went wrong. Please try again.";
}

function useCountdown(sessionExpiresAt: number | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionExpiresAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to the wall clock, an external time source with no render-time equivalent.
      setRemainingMs(null);
      return;
    }
    setRemainingMs(Math.max(0, sessionExpiresAt - Date.now()));
    const interval = setInterval(() => {
      setRemainingMs(Math.max(0, sessionExpiresAt - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  return remainingMs;
}

export function AgentThread({
  conversationId,
  initialMessages,
  outOfCredits,
  sessionExpiresAt,
  sessionEnded,
  availableModels,
  defaultModelId,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  outOfCredits: boolean;
  sessionExpiresAt: number | null;
  sessionEnded: boolean;
  availableModels?: { id: string; label: string }[];
  defaultModelId?: string;
}) {
  const router = useRouter();
  const [modelId, setModelId] = useState(defaultModelId ?? DEFAULT_MODEL_ID);
  const [input, setInput] = useState("");
  const [ending, setEnding] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [alwaysAllowed, setAlwaysAllowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only global (window.arcDesktop) on mount; SSR has no value to pass down instead.
    setIsDesktop(Boolean(window.arcDesktop));
  }, []);

  const { messages, sendMessage, addToolOutput, status, error } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/agent",
      body: () => ({ conversationId, modelId }),
    }),
    onFinish: () => router.refresh(),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const isThinking = status === "submitted";
  const disabled = isBusy || outOfCredits;
  const remainingMs = useCountdown(sessionEnded ? null : sessionExpiresAt);
  const remainingLabel =
    remainingMs !== null ? `${Math.max(0, Math.floor(remainingMs / 1000))}s left` : null;

  async function handleEndSession() {
    setEnding(true);
    try {
      await fetch("/api/agent/end-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      router.refresh();
    } finally {
      setEnding(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 px-6 py-3 dark:border-white/15">
        <ModelPicker
          value={modelId}
          onChange={setModelId}
          disabled={isBusy || sessionEnded}
          models={availableModels}
        />
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {sessionEnded ? (
            <span>Session ended</span>
          ) : (
            <>
              {remainingLabel && <span>{remainingLabel}</span>}
              <button
                onClick={handleEndSession}
                disabled={ending}
                className="rounded-md border border-black/10 px-3 py-1 text-xs font-medium transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
              >
                End session
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Describe a coding task to start. The agent can read/write files and run shell
            commands in an isolated sandbox.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex max-w-2xl flex-col gap-2 rounded-lg bg-black/5 px-4 py-3 text-sm dark:bg-white/10 ${
              message.role === "user" ? "ml-auto" : "mr-auto"
            }`}
          >
            {message.parts.map((part, i) => {
              if (part.type === "text" && "text" in part) {
                return <MessageContent key={i} content={part.text} />;
              }
              if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                const toolPart = part as unknown as {
                  type: string;
                  toolCallId: string;
                  toolName?: string;
                  input?: unknown;
                  state?: string;
                };
                const name =
                  toolPart.toolName ??
                  (toolPart.type.startsWith("tool-") ? toolPart.type.slice(5) : toolPart.type);

                if (isDesktop && isLocalToolName(name) && toolPart.state === "input-available") {
                  return (
                    <ToolPermissionPrompt
                      key={toolPart.toolCallId}
                      toolName={name}
                      input={(toolPart.input as Record<string, unknown>) ?? {}}
                      autoApproved={alwaysAllowed.has(name)}
                      onAlwaysAllow={(n) => setAlwaysAllowed((prev) => new Set(prev).add(n))}
                      onResolve={(result) => {
                        if (result.errorText !== undefined) {
                          addToolOutput({
                            tool: name,
                            toolCallId: toolPart.toolCallId,
                            state: "output-error",
                            errorText: result.errorText,
                          });
                        } else {
                          addToolOutput({
                            tool: name,
                            toolCallId: toolPart.toolCallId,
                            output: result.output,
                          });
                        }
                      }}
                    />
                  );
                }

                return <ToolCallBlock key={i} part={part as unknown as { type: string }} />;
              }
              return null;
            })}
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
      ) : sessionEnded ? (
        <div className="border-t border-black/10 p-4 text-center text-sm text-gray-500 dark:border-white/15 dark:text-gray-400">
          This session has ended. Start a new agent session to continue.
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
            placeholder="Describe a coding task..."
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

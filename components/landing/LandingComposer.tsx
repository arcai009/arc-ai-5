"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** localStorage key holding a prompt typed on the landing page before sign-in. */
export const PENDING_PROMPT_KEY = "arc_pending_prompt";

const SUGGESTIONS = [
  "Explain a tricky bug in my code",
  "Draft a product launch email",
  "Build a script to rename files",
];

export function LandingComposer() {
  const router = useRouter();
  const [input, setInput] = useState("");

  function start(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(PENDING_PROMPT_KEY, trimmed);
    } catch {
      // localStorage unavailable (private mode) — continue without carrying the prompt.
    }
    router.push("/sign-up");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(input);
  }

  return (
    <div className="relative w-full max-w-2xl">
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
          rows={2}
          className="w-full resize-none bg-transparent px-1 text-base outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Press Enter to start
          </span>
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Start chatting"
            className="btn-accent flex h-9 w-9 items-center justify-center rounded-full text-base disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => start(s)}
            className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

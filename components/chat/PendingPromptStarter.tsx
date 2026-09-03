"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PENDING_PROMPT_KEY } from "@/components/landing/LandingComposer";

/** localStorage key prefix holding a prompt to auto-send once a conversation opens. */
export const autosendKey = (conversationId: string) => `arc_autosend_${conversationId}`;

/**
 * Rendered on the chat index. If the visitor typed a prompt on the landing page
 * before signing up, this creates a fresh conversation, stashes the prompt for
 * that conversation to auto-send, and navigates into it.
 */
export function PendingPromptStarter() {
  const router = useRouter();
  const started = useRef(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (started.current) return;

    let prompt: string | null = null;
    try {
      prompt = localStorage.getItem(PENDING_PROMPT_KEY);
    } catch {
      return;
    }
    if (!prompt) return;

    started.current = true;
    setStarting(true);
    try {
      localStorage.removeItem(PENDING_PROMPT_KEY);
    } catch {
      // ignore
    }

    (async () => {
      try {
        const res = await fetch("/api/conversations", { method: "POST" });
        if (!res.ok) {
          setStarting(false);
          return;
        }
        const { id } = await res.json();
        try {
          localStorage.setItem(autosendKey(id), prompt as string);
        } catch {
          // ignore — the chat just opens empty
        }
        router.push(`/chat/${id}`);
        router.refresh();
      } catch {
        setStarting(false);
      }
    })();
  }, [router]);

  if (!starting) return null;

  return (
    <p className="text-sm text-gray-500 dark:text-gray-400">Starting your chat…</p>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function NewSessionButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only global (window.arcDesktop) on mount; SSR has no value to pass down instead.
    setIsDesktop(Boolean(window.arcDesktop));
  }, []);

  async function start(executionMode: "CLOUD" | "LOCAL") {
    setPending(true);
    setError(null);
    try {
      if (executionMode === "LOCAL") {
        const folder = await window.arcDesktop!.chooseProjectFolder();
        if (!folder) {
          setPending(false);
          return;
        }
      }

      const res = await fetch("/api/agent/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionMode }),
      });
      if (!res.ok) {
        setError("Couldn't start a new session. Please try again.");
        return;
      }
      const { id } = await res.json();
      router.push(`/agent/${id}`);
      router.refresh();
    } catch {
      setError("Couldn't start a new session. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => start("CLOUD")}
          disabled={pending}
          className="btn-accent w-full rounded-md px-3 py-2 text-sm font-medium"
        >
          {pending ? "Starting..." : "+ New agent session"}
        </button>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={() => start("LOCAL")}
        disabled={pending}
        className="btn-accent w-full rounded-md px-3 py-2 text-sm font-medium"
      >
        {pending ? "Starting..." : "+ New session (this computer)"}
      </button>
      <button
        onClick={() => start("CLOUD")}
        disabled={pending}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
      >
        {pending ? "Starting..." : "+ New session (cloud sandbox)"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

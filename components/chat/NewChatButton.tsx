"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewChatButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (!res.ok) {
        setError("Couldn't start a new chat. Please try again.");
        return;
      }
      const { id } = await res.json();
      router.push(`/chat/${id}`);
      router.refresh();
    } catch {
      setError("Couldn't start a new chat. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="btn-accent w-full rounded-md px-3 py-2 text-sm font-medium"
      >
        {pending ? "Starting..." : "+ New chat"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

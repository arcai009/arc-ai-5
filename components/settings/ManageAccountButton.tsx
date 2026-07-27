"use client";

import { useClerk } from "@clerk/nextjs";

export function ManageAccountButton() {
  const { openUserProfile } = useClerk();

  return (
    <button
      onClick={() => openUserProfile()}
      className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
    >
      Manage account
    </button>
  );
}

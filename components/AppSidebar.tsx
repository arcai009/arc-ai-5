"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { NewChatButton } from "@/components/chat/NewChatButton";
import { NewSessionButton } from "@/components/agent/NewSessionButton";

interface RecentItem {
  id: string;
  title: string;
}

export function AppSidebar({
  activeTab,
  recents,
  activeConversationId,
  email,
  balance,
  onNavigate,
}: {
  activeTab: "chat" | "code";
  recents: RecentItem[];
  activeConversationId?: string;
  email: string;
  balance: number;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? recents.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()))
    : recents;

  const basePath = activeTab === "chat" ? "/chat" : "/agent";
  const emptyLabel = activeTab === "chat" ? "No conversations yet." : "No agent sessions yet.";

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-black/10 bg-background dark:border-white/15">
      <div className="p-3">
        <Link href="/chat" onClick={onNavigate}>
          <Logo size={20} />
        </Link>
      </div>

      <div className="px-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-gray-400 dark:border-white/15"
        />
      </div>

      <div className="mt-3 flex gap-1 px-3">
        <Link
          href="/chat"
          onClick={onNavigate}
          className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "bg-[var(--accent-soft)] text-[var(--accent-solid)]"
              : "text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
          }`}
        >
          Home
        </Link>
        <Link
          href="/agent"
          onClick={onNavigate}
          className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors ${
            activeTab === "code"
              ? "bg-[var(--accent-soft)] text-[var(--accent-solid)]"
              : "text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
          }`}
        >
          Code
        </Link>
      </div>

      <div className="p-3">
        {activeTab === "chat" ? <NewChatButton /> : <NewSessionButton />}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        <p className="px-3 pb-1 text-xs font-medium text-gray-400 dark:text-gray-500">Recents</p>
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`${basePath}/${item.id}`}
            onClick={onNavigate}
            className={`truncate rounded-md border-l-2 px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
              item.id === activeConversationId
                ? "border-l-[var(--accent-solid)] bg-[var(--accent-soft)] font-medium"
                : "border-l-transparent text-gray-600 dark:text-gray-400"
            }`}
          >
            {item.title}
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            {query.trim() ? "No matches." : emptyLabel}
          </p>
        )}
      </nav>

      <div className="flex items-center gap-2 border-t border-black/10 p-3 dark:border-white/15">
        <UserMenu openUpward />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{email}</p>
        </div>
        <Link
          href="/billing"
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent-gradient)" }}
        >
          {balance}
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-3 border-t border-black/10 px-3 py-2 text-xs text-gray-500 dark:border-white/15 dark:text-gray-400">
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>
        <Link href="/support" className="hover:text-foreground">
          Support
        </Link>
      </div>
    </aside>
  );
}

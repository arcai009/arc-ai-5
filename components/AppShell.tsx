"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";

interface RecentItem {
  id: string;
  title: string;
}

export function AppShell({
  activeTab,
  recents,
  activeConversationId,
  email,
  balance,
  children,
}: {
  activeTab: "chat" | "code";
  recents: RecentItem[];
  activeConversationId?: string;
  email: string;
  balance: number;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        className="absolute left-3 top-3 z-20 rounded-md p-1.5 hover:bg-black/5 md:hidden dark:hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 z-30 bg-black/30 md:hidden"
        />
      )}
      <div
        className={`absolute inset-y-0 left-0 z-40 transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar
          activeTab={activeTab}
          recents={recents}
          activeConversationId={activeConversationId}
          email={email}
          balance={balance}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

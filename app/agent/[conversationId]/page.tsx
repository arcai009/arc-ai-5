import { notFound } from "next/navigation";
import type { UIMessage } from "ai";
import { db } from "@/lib/db";
import { getBalance } from "@/lib/credits";
import { requireAppUser } from "@/lib/current-user";
import { SANDBOX_MAX_DURATION_MS } from "@/lib/sandbox";
import { AppShell } from "@/components/AppShell";
import { AgentThread } from "@/components/agent/AgentThread";
import { configuredModelOptions, defaultConfiguredModelId } from "@/lib/models";

export default async function AgentConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { user, email } = await requireAppUser();

  const [conversations, conversation, balance] = await Promise.all([
    db.conversation.findMany({
      where: { userId: user.id, mode: "AGENT" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.conversation.findFirst({
      where: { id: conversationId, userId: user.id, mode: "AGENT" },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        sandboxSession: true,
      },
    }),
    getBalance(user.id),
  ]);

  if (!conversation) {
    notFound();
  }

  const initialMessages: UIMessage[] = conversation.messages.map((message) => ({
    id: message.id,
    role: message.role.toLowerCase() as "user" | "assistant" | "system",
    parts: [{ type: "text", text: message.content }],
  }));

  const session = conversation.sandboxSession;
  const sessionEnded = Boolean(session?.endedAt);
  const sessionExpiresAt = session
    ? session.startedAt.getTime() + SANDBOX_MAX_DURATION_MS
    : null;

  return (
    <AppShell
      activeTab="code"
      recents={conversations}
      activeConversationId={conversation.id}
      email={email}
      balance={balance}
    >
      <AgentThread
        conversationId={conversation.id}
        initialMessages={initialMessages}
        outOfCredits={balance <= 0}
        sessionExpiresAt={sessionExpiresAt}
        sessionEnded={sessionEnded}
        availableModels={configuredModelOptions()}
        defaultModelId={defaultConfiguredModelId()}
      />
    </AppShell>
  );
}

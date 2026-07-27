import { notFound } from "next/navigation";
import type { UIMessage } from "ai";
import { db } from "@/lib/db";
import { getBalance } from "@/lib/credits";
import { requireAppUser } from "@/lib/current-user";
import { AppShell } from "@/components/AppShell";
import { ChatThread } from "@/components/chat/ChatThread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { user, email } = await requireAppUser();

  const [conversations, conversation, balance] = await Promise.all([
    db.conversation.findMany({
      where: { userId: user.id, mode: "CHAT" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.conversation.findFirst({
      where: { id: conversationId, userId: user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
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

  return (
    <AppShell
      activeTab="chat"
      recents={conversations}
      activeConversationId={conversation.id}
      email={email}
      balance={balance}
    >
      <ChatThread
        conversationId={conversation.id}
        initialMessages={initialMessages}
        outOfCredits={balance <= 0}
      />
    </AppShell>
  );
}

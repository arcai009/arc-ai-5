import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getBalance } from "@/lib/credits";
import { requireAppUser } from "@/lib/current-user";
import { AppShell } from "@/components/AppShell";
import { NewSessionButton } from "@/components/agent/NewSessionButton";

export default async function AgentIndexPage() {
  const { user, email } = await requireAppUser();

  const conversations = await db.conversation.findMany({
    where: { userId: user.id, mode: "AGENT" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  if (conversations.length > 0) {
    redirect(`/agent/${conversations[0].id}`);
  }

  const balance = await getBalance(user.id);

  return (
    <AppShell activeTab="code" recents={conversations} email={email} balance={balance}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-gray-500 dark:text-gray-400">
        <p>Start a new agent session to begin.</p>
        <div className="w-full max-w-xs">
          <NewSessionButton />
        </div>
      </div>
    </AppShell>
  );
}

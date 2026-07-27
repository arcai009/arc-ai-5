import Link from "next/link";
import { db } from "@/lib/db";
import { requireAppUser } from "@/lib/current-user";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ManageAccountButton } from "@/components/settings/ManageAccountButton";
import { LocalExecutionSettings } from "@/components/settings/LocalExecutionSettings";

export default async function SettingsPage() {
  const { user, email } = await requireAppUser();

  const subscription = await db.subscription.findUnique({ where: { userId: user.id } });
  const tier = subscription?.tier === "PRO" && subscription.status === "ACTIVE" ? "Pro" : "Free";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Link href="/chat" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
          Back to chat
        </Link>
      </div>

      <section className="rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h2 className="font-medium">Account</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm font-medium">{email}</p>
          </div>
          <ManageAccountButton />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/15">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
            <p className="text-sm font-medium">{tier}</p>
          </div>
          <Link href="/billing" className="text-sm text-[var(--accent-solid)] hover:underline">
            Manage billing
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h2 className="font-medium">Appearance</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode.</p>
          </div>
          <ThemeToggle className="rounded-full border border-black/10 p-2 text-gray-500 transition-colors hover:bg-black/5 hover:text-foreground dark:border-white/15 dark:text-gray-400 dark:hover:bg-white/10" />
        </div>
      </section>

      <section className="rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h2 className="font-medium">Language</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">English (more languages coming soon).</p>
      </section>

      <LocalExecutionSettings />
    </main>
  );
}

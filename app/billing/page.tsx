import Link from "next/link";
import { db } from "@/lib/db";
import { getBalance, getLedgerHistory } from "@/lib/credits";
import { requireAppUser } from "@/lib/current-user";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { TopUpForm } from "@/components/billing/TopUpForm";
import { UsageHistoryTable } from "@/components/billing/UsageHistoryTable";
import { ThemeToggle } from "@/components/ThemeToggle";

const HISTORY_PAGE_SIZE = 25;

export default async function BillingPage() {
  const { user, email } = await requireAppUser();

  const [subscription, balance, ledgerEntries] = await Promise.all([
    db.subscription.findUnique({ where: { userId: user.id } }),
    getBalance(user.id),
    getLedgerHistory(user.id, { skip: 0, take: HISTORY_PAGE_SIZE }),
  ]);

  const tier = subscription?.tier ?? "FREE";
  const status = subscription?.status ?? "ACTIVE";
  const isPro = tier === "PRO" && status === "ACTIVE";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/chat" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            Back to chat
          </Link>
        </div>
      </div>

      <section className="rounded-lg border border-black/10 p-6 dark:border-white/15">
        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as {email}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current plan</p>
            <p className="text-lg font-medium">
              {tier === "PRO" ? "Pro" : "Free"}{" "}
              {subscription && status !== "ACTIVE" && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({status.toLowerCase().replace("_", " ")})
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Credit balance</p>
            <p className="text-lg font-medium">{balance} credits</p>
          </div>
        </div>
        {subscription?.currentPeriodEnd && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Renews {subscription.currentPeriodEnd.toLocaleDateString()}
          </p>
        )}
      </section>

      <section
        className="rounded-lg border p-6"
        style={{ borderColor: "var(--accent-solid)", background: "var(--accent-soft)" }}
      >
        <h2 className="font-medium">Upgrade to Pro</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A larger monthly credit grant and higher rate limits.
        </p>
        <div className="mt-4">
          {isPro ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">You&rsquo;re on Pro.</p>
          ) : (
            <CheckoutButton purpose="pro_subscription" label="Upgrade to Pro" />
          )}
        </div>
      </section>

      <section className="rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h2 className="font-medium">Buy credits</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          One-time top-up, on top of any plan. Pick an amount or enter your own.
        </p>
        <div className="mt-4">
          <TopUpForm />
        </div>
      </section>

      <section className="rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h2 className="font-medium">Usage history</h2>
        <div className="mt-4">
          <UsageHistoryTable
            initialEntries={ledgerEntries}
            hasMore={ledgerEntries.length === HISTORY_PAGE_SIZE}
            pageSize={HISTORY_PAGE_SIZE}
          />
        </div>
      </section>
    </main>
  );
}

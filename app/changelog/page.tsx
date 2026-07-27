import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const ENTRIES = [
  {
    title: "Desktop app & unified home",
    items: [
      "Windows desktop app with a local, permission-gated coding agent",
      "Unified home dashboard for recent chats and code sessions",
      "Windows download page",
    ],
  },
  {
    title: "Branded redesign & account menu",
    items: [
      "Manual dark/light theme toggle",
      "Custom-dollar-amount credit top-ups",
      "Arc Nova and Arc Flux models",
      "Terms, Support, and this Changelog page",
      "Redesigned account menu",
    ],
  },
  {
    title: "Polish pass",
    items: [
      "Collapsible mobile sidebars",
      "Inline error states and retry affordances",
      "Streaming response indicators",
      "Empty-state calls to action",
    ],
  },
  {
    title: "Usage history",
    items: ["Paginated credit ledger view on the Billing page"],
  },
  {
    title: "Coding agent",
    items: ["Sandboxed coding agent sessions alongside chat"],
  },
  {
    title: "Payments",
    items: ["Checkout, subscriptions, and webhook-driven credit grants"],
  },
  {
    title: "Credits",
    items: ["Per-message credit reservation and an append-only usage ledger"],
  },
  {
    title: "Chat",
    items: ["Streaming chat with a model picker"],
  },
  {
    title: "Launch",
    items: ["Sign up, sign in, and your first conversation"],
  },
];

export default async function ChangelogPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader signedIn={Boolean(userId)} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold">Changelog</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">What&rsquo;s shipped in Arc AI so far.</p>

        <ol className="mt-8 flex flex-col gap-8">
          {ENTRIES.map((entry, i) => (
            <li key={entry.title} className="relative border-l border-black/10 pl-6 dark:border-white/15">
              <span
                className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full"
                style={{ background: "var(--accent-gradient)" }}
              />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Phase {ENTRIES.length - i}
              </p>
              <h2 className="mt-0.5 font-medium">{entry.title}</h2>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}

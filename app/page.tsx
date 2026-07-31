import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const FEATURES = [
  {
    title: "Chat with frontier models",
    description:
      "Talk to Arc Nova and Arc Flux, our streaming chat models, with full conversation history saved to your account.",
  },
  {
    title: "A coding agent that ships code",
    description:
      "Describe a task and the agent reads, writes, and runs code for you — in an isolated cloud sandbox, or locally on your own machine via the desktop app.",
  },
  {
    title: "Local execution, real permissions",
    description:
      "The Windows desktop app runs the coding agent on your computer, in a folder you choose, with an explicit approve/deny prompt before every file write or command.",
  },
  {
    title: "Credits, not confusing tiers",
    description:
      "Pay for what you use with a simple credit balance. Top up any amount, or subscribe to Pro for a larger monthly grant.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Sign up",
    description: "Create an account with email or Google — you get free credits to start.",
  },
  {
    step: "2",
    title: "Chat or code",
    description: "Start a conversation, or spin up a coding agent session for a real task.",
  },
  {
    step: "3",
    title: "Top up as you go",
    description: "Buy more credits or go Pro whenever you need more, right from Billing.",
  },
];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Arc AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, Windows",
  description:
    "Arc AI is an AI chat and coding agent platform. Chat with frontier models and run a sandboxed or local coding agent, in your browser or in the Arc AI desktop app for Windows.",
  url: "https://app.arcai.io",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free credits on signup, with pay-as-you-go top-ups and a Pro plan.",
  },
};

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/chat");
  }

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <SiteHeader signedIn={false} />
      <main>
        <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--accent-1), var(--accent-2) 45%, transparent 70%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-4">
            <LogoMark size={56} />
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="brand-gradient-text">arc ai</span>
            </h1>
            <p className="max-w-md text-base text-gray-500 dark:text-gray-400">
              Chat with frontier models and run a sandboxed coding agent, all in
              one place.
            </p>
          </div>
          <div className="relative flex gap-4">
            <Link
              href="/sign-up"
              className="btn-accent rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
          <Link
            href="/download"
            className="relative text-sm text-gray-500 transition-colors hover:text-foreground dark:text-gray-400"
          >
            Or download the app for Windows &rarr;
          </Link>
        </section>

        <section className="border-t border-black/10 px-6 py-16 dark:border-white/15">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-semibold">
              Everything you need in one AI platform
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-black/10 p-6 dark:border-white/15"
                >
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 px-6 py-16 dark:border-white/15">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold">How it works</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map((item) => (
                <div key={item.step} className="text-center">
                  <div
                    className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    {item.step}
                  </div>
                  <h3 className="mt-3 font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 px-6 py-16 text-center dark:border-white/15">
          <h2 className="text-2xl font-semibold">Ready to try Arc AI?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Sign up in seconds and start chatting or coding right away.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="btn-accent rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
            >
              Get started for free
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

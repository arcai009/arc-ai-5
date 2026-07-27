import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/chat");
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader signedIn={false} />
      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center">
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
      </main>
      <SiteFooter />
    </div>
  );
}

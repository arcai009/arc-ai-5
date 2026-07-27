import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
      <Link href="/">
        <Logo size={20} />
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/download"
          className="hidden text-gray-500 transition-colors hover:text-foreground sm:inline dark:text-gray-400"
        >
          Download
        </Link>
        <Link
          href="/support"
          className="hidden text-gray-500 transition-colors hover:text-foreground sm:inline dark:text-gray-400"
        >
          Support
        </Link>
        <Link
          href="/terms"
          className="hidden text-gray-500 transition-colors hover:text-foreground sm:inline dark:text-gray-400"
        >
          Terms
        </Link>
        <ThemeToggle />
        {signedIn ? (
          <Link
            href="/chat"
            className="rounded-full border border-black/10 px-4 py-1.5 font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Go to app
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="text-gray-500 transition-colors hover:text-foreground dark:text-gray-400"
            >
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-accent rounded-full px-4 py-1.5 font-medium">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 px-6 py-8 dark:border-white/15">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center text-sm text-gray-500 sm:flex-row sm:justify-between sm:text-left dark:text-gray-400">
        <Logo size={16} />
        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/download" className="transition-colors hover:text-foreground">
            Download
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/support" className="transition-colors hover:text-foreground">
            Support
          </Link>
          <a href="mailto:info@arcai.io" className="transition-colors hover:text-foreground">
            info@arcai.io
          </a>
        </nav>
        <p>&copy; {year} Arc AI</p>
      </div>
    </footer>
  );
}

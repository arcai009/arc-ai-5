import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Download for Windows",
  description:
    "Download the Arc AI desktop app for Windows — chat and run the coding agent locally on your own computer with permission-gated file and command access.",
  alternates: { canonical: "/download" },
};

export default async function DownloadPage() {
  const { userId } = await auth();
  const downloadUrl = process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader signedIn={Boolean(userId)} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Arc AI for Windows</h1>
        <p className="max-w-md text-gray-500 dark:text-gray-400">
          Chat and run the coding agent right on your own computer &mdash; file edits and shell
          commands happen on your machine, in a folder you choose, with a permission prompt before
          every action.
        </p>

        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="btn-accent rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Download for Windows
          </a>
        ) : (
          <div className="rounded-lg border border-black/10 px-6 py-4 text-sm text-gray-500 dark:border-white/15 dark:text-gray-400">
            The Windows download isn&rsquo;t published yet &mdash; check back soon.
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">Windows 10/11, 64-bit.</p>
      </main>
      <SiteFooter />
    </div>
  );
}

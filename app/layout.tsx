import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://app.arcai.io";
const SITE_DESCRIPTION =
  "Arc AI is an AI chat and coding agent platform. Chat with frontier models like Arc Nova and Arc Flux, and run a sandboxed or local coding agent that reads, writes, and runs code for you — in your browser or in the Arc AI desktop app for Windows.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arc AI — AI Chat & Coding Agent",
    template: "%s — Arc AI",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Arc AI",
    "AI chat",
    "AI coding agent",
    "AI assistant",
    "coding assistant",
    "chatgpt alternative",
    "claude alternative",
    "AI desktop app",
  ],
  authors: [{ name: "Arc AI" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Arc AI",
    title: "Arc AI — AI Chat & Coding Agent",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "Arc AI — AI Chat & Coding Agent",
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

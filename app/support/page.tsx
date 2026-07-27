import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const FAQS = [
  {
    q: "How do credits work?",
    a: "Every chat message and coding-agent action costs credits, based on tokens used (and sandbox time for the coding agent). You get a free grant on signup, and can top up or subscribe to Pro for more.",
  },
  {
    q: "How do I buy more credits?",
    a: "Go to Billing, and either pick a preset amount or enter a custom dollar amount in the \"Buy credits\" section.",
  },
  {
    q: "How do I cancel my Pro subscription?",
    a: "From the Billing page — cancelling stops future renewals; you keep access until the end of the current billing period.",
  },
  {
    q: "I was charged incorrectly, what do I do?",
    a: "Email us at info@arcai.io with your account email and the approximate charge date, and we'll look into it.",
  },
];

export default async function SupportPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader signedIn={Boolean(userId)} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold">Support</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Need help? Email us at{" "}
          <a href="mailto:info@arcai.io" className="text-[var(--accent-solid)] hover:underline">
            info@arcai.io
          </a>{" "}
          and we&rsquo;ll get back to you.
        </p>

        <div className="mt-8 flex flex-col gap-6">
          {FAQS.map((faq) => (
            <div key={faq.q}>
              <h2 className="font-medium">{faq.q}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

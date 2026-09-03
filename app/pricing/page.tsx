import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PricingPlans } from "@/components/pricing/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Arc AI pricing — start free, then upgrade to Pro, Pro+, or Ultra for more usage, all models, and the cloud coding agent. Pay-as-you-go credit top-ups on every plan.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader signedIn={signedIn} />
      <main className="flex-1">
        <section className="px-6 pb-8 pt-16 text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plans</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 dark:text-gray-400">
            Start free. Upgrade when you need the best models, higher limits, and cloud
            coding agents.
          </p>
        </section>

        <section className="border-t border-black/10 py-14 dark:border-white/15">
          <PricingPlans signedIn={signedIn} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

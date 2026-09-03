"use client";

import Link from "next/link";
import { useState } from "react";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  cta: string;
  href: (signedIn: boolean) => string;
  highlight?: boolean;
  featuresHeading: string;
  features: string[];
};

// Placeholder prices — Free and Pro ($20) exist as real Dodo products; Pro+ and
// Ultra are layout placeholders until their products are created.
const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "Try Arc AI",
    monthly: 0,
    cta: "Start free",
    href: (s) => (s ? "/chat" : "/sign-up"),
    featuresHeading: "Includes:",
    features: ["Access to Arc Flux", "3 messages", "Community support"],
  },
  {
    name: "Pro",
    tagline: "For regular use",
    monthly: 20,
    cta: "Choose Pro",
    href: (s) => (s ? "/billing" : "/sign-up"),
    featuresHeading: "Everything in Free, plus:",
    features: [
      "All models (Arc Nova, Arc Flux, Gemini)",
      "Unlimited messages",
      "10,000 credits / month",
      "Cloud coding agent",
    ],
  },
  {
    name: "Pro+",
    tagline: "For power users",
    monthly: 60,
    cta: "Choose Pro+",
    href: (s) => (s ? "/billing" : "/sign-up"),
    highlight: true,
    featuresHeading: "Everything in Pro, plus:",
    features: ["3x more usage than Pro", "Priority support"],
  },
  {
    name: "Ultra",
    tagline: "For intensive daily use",
    monthly: 200,
    cta: "Choose Ultra",
    href: (s) => (s ? "/billing" : "/sign-up"),
    featuresHeading: "Everything in Pro, plus:",
    features: ["10x more usage than Pro", "Priority access to new features"],
  },
];

export function PricingPlans({ signedIn }: { signedIn: boolean }) {
  const [yearly, setYearly] = useState(false);

  function priceLabel(monthly: number) {
    if (monthly === 0) return { amount: "$0", suffix: "/ month" };
    if (yearly) {
      const perMonth = Math.round((monthly * 10) / 12); // 2 months free
      return { amount: `$${perMonth}`, suffix: "/ mo, billed yearly" };
    }
    return { amount: `$${monthly}`, suffix: "/ month" };
  }

  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-xl font-semibold">Individual plans</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Prices in USD. Change or cancel any time from Billing.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-black/10 p-1 text-sm dark:border-white/15">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              !yearly ? "bg-black/10 font-medium dark:bg-white/15" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              yearly ? "bg-black/10 font-medium dark:bg-white/15" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Yearly <span className="text-[var(--accent-solid)]">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = priceLabel(plan.monthly);
          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-[var(--accent-solid)] shadow-md"
                  : "border-black/10 dark:border-white/15"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 right-6 rounded-full bg-[var(--accent-solid)] px-3 py-0.5 text-xs font-medium text-white">
                  Recommended
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{price.amount}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{price.suffix}</span>
              </div>
              <p className="mt-1 h-4 text-xs text-gray-400 dark:text-gray-500">
                {plan.monthly === 0 ? "No payment method required" : ""}
              </p>

              <Link
                href={plan.href(signedIn)}
                className={`mt-5 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
                  plan.highlight
                    ? "btn-accent"
                    : "border border-black/10 dark:border-white/15"
                }`}
              >
                {plan.cta} →
              </Link>

              <p className="mt-6 text-sm font-medium">{plan.featuresHeading}</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-[var(--accent-solid)]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Prefer pay-as-you-go? Every plan can top up credits any time — buy any amount from Billing.
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import type { CheckoutPurpose } from "@/lib/dodo";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  cta: string;
  purpose?: Extract<CheckoutPurpose, "pro_subscription" | "pro_plus" | "ultra">;
  freeHref?: string; // used by the Free plan instead of checkout
  highlight?: boolean;
  featuresHeading: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "Try Arc AI",
    price: "$0",
    priceNote: "No payment method required",
    cta: "Start free",
    freeHref: "/chat",
    featuresHeading: "Includes:",
    features: ["Access to Arc Flux", "3 messages", "Community support"],
  },
  {
    name: "Pro",
    tagline: "For regular use",
    price: "$20",
    priceNote: "Billed monthly",
    cta: "Choose Pro",
    purpose: "pro_subscription",
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
    price: "$60",
    priceNote: "Billed monthly",
    cta: "Choose Pro+",
    purpose: "pro_plus",
    highlight: true,
    featuresHeading: "Everything in Pro, plus:",
    features: ["30,000 credits / month (3x Pro)", "Priority support"],
  },
  {
    name: "Ultra",
    tagline: "For intensive daily use",
    price: "$200",
    priceNote: "Billed monthly",
    cta: "Choose Ultra",
    purpose: "ultra",
    featuresHeading: "Everything in Pro, plus:",
    features: ["100,000 credits / month (10x Pro)", "Priority access to new features"],
  },
];

function PlanCta({ plan, signedIn }: { plan: Plan; signedIn: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base =
    "mt-5 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90";
  const style = plan.highlight ? "btn-accent" : "border border-black/10 dark:border-white/15";

  // Free plan, or any logged-out visitor: just route into the product.
  if (!plan.purpose || !signedIn) {
    const href = plan.purpose ? "/sign-up" : signedIn ? plan.freeHref ?? "/chat" : "/sign-up";
    return (
      <Link href={href} className={`${base} ${style}`}>
        {plan.cta} →
      </Link>
    );
  }

  // Signed-in visitor picking a paid tier: start Dodo checkout.
  async function handleCheckout() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: plan.purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setPending(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-1">
      <button
        onClick={handleCheckout}
        disabled={pending}
        className={`${base.replace("mt-5 ", "")} ${style}`}
      >
        {pending ? "Redirecting…" : `${plan.cta} →`}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function PricingPlans({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div>
        <h2 className="text-xl font-semibold">Individual plans</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Prices in USD. Change or cancel any time from Billing.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
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
              <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ month</span>
            </div>
            <p className="mt-1 h-4 text-xs text-gray-400 dark:text-gray-500">{plan.priceNote}</p>

            <PlanCta plan={plan} signedIn={signedIn} />

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
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Prefer pay-as-you-go? Every plan can top up credits any time — buy any amount from Billing.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

// Display-only estimate (server computes credits from the actual amount charged,
// via DODO_CREDITS_PER_DOLLAR — see lib/dodo.ts). Keep in sync with that default.
const CREDITS_PER_DOLLAR = 100;
const PRESET_AMOUNTS = [10, 25, 50, 100];

export function TopUpForm() {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const validAmount = Number.isFinite(effectiveAmount) && effectiveAmount > 0;
  const estimatedCredits = validAmount ? Math.round(effectiveAmount * CREDITS_PER_DOLLAR) : 0;

  async function handleClick() {
    if (!validAmount) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "topup", amountUsd: effectiveAmount }),
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setAmount(preset);
              setCustomAmount("");
            }}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              !customAmount && amount === preset
                ? "border-transparent text-white"
                : "border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            }`}
            style={
              !customAmount && amount === preset ? { background: "var(--accent-gradient)" } : undefined
            }
          >
            ${preset}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Custom:</span>
        <div className="flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 dark:border-white/15">
          <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Other amount"
            className="w-24 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {validAmount
          ? `≈ ${estimatedCredits.toLocaleString()} credits`
          : "Enter an amount to see the credits you'll receive"}
      </p>

      <button
        onClick={handleClick}
        disabled={pending || !validAmount}
        className="btn-accent w-full rounded-md px-4 py-2 text-sm font-medium sm:w-auto"
      >
        {pending ? "Redirecting..." : "Buy credits"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

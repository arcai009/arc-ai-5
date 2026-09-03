import DodoPayments from "dodopayments";
import type { SubscriptionTier } from "@/app/generated/prisma/client";

export type CheckoutPurpose = "pro_subscription" | "pro_plus" | "ultra" | "topup";

/** The paid subscription purposes, in ascending order of tier. */
export type SubscriptionPurpose = "pro_subscription" | "pro_plus" | "ultra";

export function isDodoConfigured(): boolean {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY);
}

export function getDodoClient(): DodoPayments {
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    environment:
      process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
}

export function productIdForPurpose(purpose: CheckoutPurpose): string | undefined {
  switch (purpose) {
    case "pro_subscription":
      return process.env.DODO_PRO_PRODUCT_ID;
    case "pro_plus":
      return process.env.DODO_PROPLUS_PRODUCT_ID;
    case "ultra":
      return process.env.DODO_ULTRA_PRODUCT_ID;
    case "topup":
      return process.env.DODO_TOPUP_PRODUCT_ID;
  }
}

export const PRO_MONTHLY_CREDITS = Number(process.env.DODO_PRO_MONTHLY_CREDITS ?? "10000");
export const PROPLUS_MONTHLY_CREDITS = Number(
  process.env.DODO_PROPLUS_MONTHLY_CREDITS ?? "30000",
);
export const ULTRA_MONTHLY_CREDITS = Number(process.env.DODO_ULTRA_MONTHLY_CREDITS ?? "100000");
export const TOPUP_CREDITS = Number(process.env.DODO_TOPUP_CREDITS ?? "5000");

/** Map a paid subscription purpose to the tier it grants and its monthly credit allotment. */
export function planForPurpose(
  purpose: string,
): { tier: SubscriptionTier; monthlyCredits: number } {
  switch (purpose) {
    case "ultra":
      return { tier: "ULTRA", monthlyCredits: ULTRA_MONTHLY_CREDITS };
    case "pro_plus":
      return { tier: "PRO_PLUS", monthlyCredits: PROPLUS_MONTHLY_CREDITS };
    default:
      // pro_subscription and any unknown/legacy value fall back to Pro.
      return { tier: "PRO", monthlyCredits: PRO_MONTHLY_CREDITS };
  }
}

/**
 * Credits granted per US dollar for custom-amount top-ups. Requires the Dodo top-up
 * product to be configured as "pay what you want" in the Dodo dashboard — see README.
 */
export const CREDITS_PER_DOLLAR = Number(process.env.DODO_CREDITS_PER_DOLLAR ?? "100");

export const TOPUP_MIN_USD = 1;
export const TOPUP_MAX_USD = 1000;

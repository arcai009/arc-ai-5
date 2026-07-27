import DodoPayments from "dodopayments";

export type CheckoutPurpose = "pro_subscription" | "topup";

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
  return purpose === "pro_subscription"
    ? process.env.DODO_PRO_PRODUCT_ID
    : process.env.DODO_TOPUP_PRODUCT_ID;
}

export const PRO_MONTHLY_CREDITS = Number(process.env.DODO_PRO_MONTHLY_CREDITS ?? "10000");
export const TOPUP_CREDITS = Number(process.env.DODO_TOPUP_CREDITS ?? "5000");

/**
 * Credits granted per US dollar for custom-amount top-ups. Requires the Dodo top-up
 * product to be configured as "pay what you want" in the Dodo dashboard — see README.
 */
export const CREDITS_PER_DOLLAR = Number(process.env.DODO_CREDITS_PER_DOLLAR ?? "100");

export const TOPUP_MIN_USD = 1;
export const TOPUP_MAX_USD = 1000;

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import {
  getDodoClient,
  isDodoConfigured,
  planForPurpose,
  TOPUP_CREDITS,
  CREDITS_PER_DOLLAR,
} from "@/lib/dodo";
import type { WebhookPayload } from "dodopayments/resources/webhook-events";

export async function POST(req: Request) {
  if (!isDodoConfigured()) {
    console.error("Dodo webhook received but DODO_PAYMENTS_API_KEY is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const webhookId = headerPayload.get("webhook-id");
  const webhookTimestamp = headerPayload.get("webhook-timestamp");
  const webhookSignature = headerPayload.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  const body = await req.text();
  const client = getDodoClient();

  let payload: WebhookPayload;
  try {
    payload = client.webhooks.unwrap(body, {
      headers: {
        "webhook-id": webhookId,
        "webhook-timestamp": webhookTimestamp,
        "webhook-signature": webhookSignature,
      },
    }) as WebhookPayload;
  } catch (err) {
    console.error("Dodo webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.processedWebhookEvent.create({
        data: { id: webhookId, source: "dodo", eventType: payload.type },
      });

      await handleEvent(tx, payload);
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Already processed this webhook-id — acknowledge without reprocessing.
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw err;
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(tx: Prisma.TransactionClient, payload: WebhookPayload) {
  const data = payload.data as unknown as Record<string, unknown>;
  const metadata = (data.metadata ?? {}) as Record<string, string | number | boolean>;
  const userId = typeof metadata.userId === "string" ? metadata.userId : undefined;

  switch (payload.type) {
    case "payment.succeeded": {
      if (!userId || metadata.purpose !== "topup") return;
      const totalAmountCents = data.total_amount as number | undefined;
      const credits =
        typeof totalAmountCents === "number"
          ? Math.round((totalAmountCents / 100) * CREDITS_PER_DOLLAR)
          : TOPUP_CREDITS;

      await tx.creditLedger.create({
        data: {
          userId,
          delta: credits,
          reason: "topup_purchase",
          relatedCallId: (data.payment_id as string) ?? null,
        },
      });
      return;
    }

    case "subscription.active":
    case "subscription.renewed": {
      if (!userId) return;
      const subscriptionId = data.subscription_id as string | undefined;
      const customerId =
        (data.customer as { customer_id?: string } | undefined)?.customer_id ?? null;
      const nextBillingDate = data.next_billing_date
        ? new Date(data.next_billing_date as string)
        : null;

      // The plan (tier + monthly credits) is derived from the checkout purpose
      // carried through in metadata; unknown/legacy values fall back to Pro.
      const purpose = typeof metadata.purpose === "string" ? metadata.purpose : "";
      const { tier, monthlyCredits } = planForPurpose(purpose);

      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          tier,
          status: "ACTIVE",
          currentPeriodEnd: nextBillingDate,
          paymentProviderCustomerId: customerId,
        },
        update: {
          tier,
          status: "ACTIVE",
          currentPeriodEnd: nextBillingDate,
          paymentProviderCustomerId: customerId,
        },
      });

      await tx.creditLedger.create({
        data: {
          userId,
          delta: monthlyCredits,
          reason: "subscription_grant",
          relatedCallId: subscriptionId ?? null,
        },
      });
      return;
    }

    case "subscription.cancelled":
    case "subscription.expired": {
      if (!userId) return;
      await tx.subscription.updateMany({
        where: { userId },
        data: { status: "CANCELED" },
      });
      return;
    }

    case "subscription.failed": {
      if (!userId) return;
      await tx.subscription.updateMany({
        where: { userId },
        data: { status: "PAST_DUE" },
      });
      return;
    }

    case "payment.failed":
      // Nothing was granted for a failed payment — nothing to reconcile.
      return;

    default:
      // Unhandled event type — acknowledged and ignored.
      return;
  }
}

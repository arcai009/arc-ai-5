import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  getDodoClient,
  isDodoConfigured,
  productIdForPurpose,
  TOPUP_MIN_USD,
  TOPUP_MAX_USD,
  type CheckoutPurpose,
} from "@/lib/dodo";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json(
      { error: "Account is still being set up, try again shortly." },
      { status: 400 },
    );
  }

  if (!isDodoConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't configured yet — missing DODO_PAYMENTS_API_KEY." },
      { status: 400 },
    );
  }

  const body = (await req.json()) as { purpose?: CheckoutPurpose; amountUsd?: number };
  const purpose = body.purpose;
  const VALID_PURPOSES: CheckoutPurpose[] = ["pro_subscription", "pro_plus", "ultra", "topup"];
  if (!purpose || !VALID_PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
  }

  const productId = productIdForPurpose(purpose);
  if (!productId) {
    return NextResponse.json(
      { error: `No product configured for ${purpose}.` },
      { status: 400 },
    );
  }

  let amountCents: number | undefined;
  if (purpose === "topup" && body.amountUsd !== undefined) {
    const amountUsd = Number(body.amountUsd);
    if (!Number.isFinite(amountUsd) || amountUsd < TOPUP_MIN_USD || amountUsd > TOPUP_MAX_USD) {
      return NextResponse.json(
        { error: `Amount must be between $${TOPUP_MIN_USD} and $${TOPUP_MAX_USD}.` },
        { status: 400 },
      );
    }
    amountCents = Math.round(amountUsd * 100);
  }

  const origin = new URL(req.url).origin;
  const client = getDodoClient();

  const session = await client.checkoutSessions.create({
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        ...(amountCents !== undefined ? { amount: amountCents } : {}),
      },
    ],
    customer: { email: user.email },
    return_url: `${origin}/billing`,
    metadata: { userId: user.id, purpose },
  });

  if (!session.checkout_url) {
    return NextResponse.json({ error: "Checkout session had no URL" }, { status: 502 });
  }

  return NextResponse.json({ checkoutUrl: session.checkout_url });
}

import { Prisma } from "@/app/generated/prisma/client";
import type { User } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";

const SIGNUP_FREE_CREDITS = Number(process.env.SIGNUP_FREE_CREDITS ?? "1000");

/**
 * Creates the app-side User row (+ signup credit grant + FREE subscription) for a Clerk
 * account, if one doesn't already exist. Idempotent and safe to call concurrently from both
 * the Clerk webhook and the lazy fallback in requireAppUser (unique clerkId constraint decides
 * the race; the loser just re-reads what the winner created).
 */
export async function provisionUser(clerkId: string, email: string): Promise<User> {
  const existing = await db.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  try {
    return await db.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { clerkId, email } });

      await tx.creditLedger.create({
        data: { userId: user.id, delta: SIGNUP_FREE_CREDITS, reason: "signup_grant" },
      });

      await tx.subscription.create({
        data: { userId: user.id, tier: "FREE", status: "ACTIVE" },
      });

      return user;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const user = await db.user.findUnique({ where: { clerkId } });
      if (user) return user;
    }
    throw err;
  }
}

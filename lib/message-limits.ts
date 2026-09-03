import { db } from "@/lib/db";

/**
 * Free (non-Pro) users can send at most this many messages in total, across all
 * their chat and agent conversations. Pro subscribers are unlimited (credit-gated).
 */
export const FREE_MESSAGE_LIMIT = 3;

/**
 * Emails that are always unlimited regardless of plan (owner / staff accounts).
 * Configured via UNLIMITED_MESSAGE_EMAILS as a comma-separated list; matching is
 * case-insensitive and whitespace-trimmed.
 */
function unlimitedEmails(): Set<string> {
  return new Set(
    (process.env.UNLIMITED_MESSAGE_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isUnlimitedEmail(email: string): boolean {
  return unlimitedEmails().has(email.trim().toLowerCase());
}

/** A user is on a paid plan while their subscription is any non-FREE tier and ACTIVE. */
export async function isProUser(userId: string): Promise<boolean> {
  const subscription = await db.subscription.findUnique({ where: { userId } });
  return (
    subscription?.status === "ACTIVE" &&
    subscription?.tier !== undefined &&
    subscription.tier !== "FREE"
  );
}

/** Number of user-authored messages the user has sent, across every conversation. */
export async function countUserMessages(userId: string): Promise<number> {
  return db.message.count({
    where: { role: "USER", conversation: { userId } },
  });
}

export type MessageLimitCheck =
  | { allowed: true }
  | { allowed: false; used: number; limit: number };

/**
 * Whether the user may send another message. Pro users always may; free users may
 * until they've sent FREE_MESSAGE_LIMIT messages. Call before persisting the new
 * message so the count reflects only messages already sent.
 */
export async function checkMessageLimit(
  userId: string,
  email: string,
): Promise<MessageLimitCheck> {
  if (isUnlimitedEmail(email)) return { allowed: true };
  if (await isProUser(userId)) return { allowed: true };

  const used = await countUserMessages(userId);
  if (used >= FREE_MESSAGE_LIMIT) return { allowed: false, used, limit: FREE_MESSAGE_LIMIT };
  return { allowed: true };
}

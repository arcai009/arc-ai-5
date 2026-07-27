import { Sandbox } from "e2b";
import { db } from "@/lib/db";
import type { SandboxSession } from "@/app/generated/prisma/client";

export const SANDBOX_MAX_DURATION_MS = 10 * 60 * 1000; // 10 minutes
export const SANDBOX_CREDITS_PER_MINUTE = 50;

export function isE2BConfigured(): boolean {
  return Boolean(process.env.E2B_API_KEY);
}

export function sandboxReservationAmount(): number {
  return Math.ceil((SANDBOX_MAX_DURATION_MS / 60000) * SANDBOX_CREDITS_PER_MINUTE);
}

export function creditsForDuration(durationSeconds: number): number {
  return Math.ceil((durationSeconds / 60) * SANDBOX_CREDITS_PER_MINUTE);
}

export async function createSandbox(): Promise<Sandbox> {
  return Sandbox.create({
    timeoutMs: SANDBOX_MAX_DURATION_MS,
    allowInternetAccess: false,
  });
}

export async function connectSandbox(externalId: string): Promise<Sandbox> {
  return Sandbox.connect(externalId);
}

export async function killSandbox(externalId: string): Promise<void> {
  await Sandbox.kill(externalId);
}

/**
 * Ends a sandbox session: reconciles the reserved credits against actual
 * duration and best-effort kills the underlying sandbox. Safe to call on an
 * already-ended session (no-op).
 */
export async function endSandboxSession(session: SandboxSession): Promise<void> {
  if (session.endedAt) return;

  const endedAt = new Date();
  const durationSeconds = Math.min(
    Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000),
    Math.floor(SANDBOX_MAX_DURATION_MS / 1000),
  );
  const actualCost = creditsForDuration(durationSeconds);
  const reserved = sandboxReservationAmount();

  await db.$transaction(async (tx) => {
    await tx.sandboxSession.update({
      where: { id: session.id },
      data: { endedAt, durationSeconds, creditsCharged: actualCost },
    });
    await tx.creditLedger.create({
      data: {
        userId: session.userId,
        delta: reserved - actualCost,
        reason: "sandbox_reconcile",
        relatedCallId: session.id,
      },
    });
  });

  if (session.externalId) {
    try {
      await killSandbox(session.externalId);
    } catch {
      // Sandbox may have already timed out on E2B's side — nothing more to do.
    }
  }
}

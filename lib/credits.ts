import { db } from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ModelConfig } from "@/lib/models";

/** Flat token estimate used to size the pre-call credit reservation. */
export const RESERVE_TOKENS = 1500;

export async function getBalance(userId: string): Promise<number> {
  const result = await db.creditLedger.aggregate({
    where: { userId },
    _sum: { delta: true },
  });

  return result._sum.delta ?? 0;
}

export function creditsForTokens(model: ModelConfig, tokens: number): number {
  return Math.ceil((tokens / 1000) * model.creditsPer1kTokens);
}

export function reservationAmount(model: ModelConfig): number {
  return creditsForTokens(model, RESERVE_TOKENS);
}

type Tx = Prisma.TransactionClient;

export async function getBalanceInTx(tx: Tx, userId: string): Promise<number> {
  const result = await tx.creditLedger.aggregate({
    where: { userId },
    _sum: { delta: true },
  });

  return result._sum.delta ?? 0;
}

export type LedgerEntry = {
  id: string;
  delta: number;
  reason: string;
  createdAt: Date;
};

export async function getLedgerHistory(
  userId: string,
  { skip, take }: { skip: number; take: number },
): Promise<LedgerEntry[]> {
  return db.creditLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: { id: true, delta: true, reason: true, createdAt: true },
  });
}

export async function getLedgerCount(userId: string): Promise<number> {
  return db.creditLedger.count({ where: { userId } });
}

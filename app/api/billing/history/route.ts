import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getLedgerHistory } from "@/lib/credits";

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
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

  const skip = Number(request.nextUrl.searchParams.get("skip") ?? "0");

  const entries = await getLedgerHistory(user.id, {
    skip: Number.isFinite(skip) && skip > 0 ? skip : 0,
    take: PAGE_SIZE,
  });

  return NextResponse.json({ entries });
}

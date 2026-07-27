import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

  const body = (await req.json().catch(() => ({}))) as { executionMode?: string };
  const executionMode = body.executionMode === "LOCAL" ? "LOCAL" : "CLOUD";

  const conversation = await db.conversation.create({
    data: { userId: user.id, mode: "AGENT", executionMode, title: "New agent session" },
  });

  return NextResponse.json({ id: conversation.id });
}

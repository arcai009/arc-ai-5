import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { endSandboxSession } from "@/lib/sandbox";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 400 });
  }

  const { conversationId } = (await req.json()) as { conversationId?: string };
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, userId: user.id, mode: "AGENT" },
    include: { sandboxSession: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (conversation.sandboxSession) {
    await endSandboxSession(conversation.sandboxSession);
  }

  return NextResponse.json({ ended: true });
}

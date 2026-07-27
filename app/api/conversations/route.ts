import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST() {
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

  const conversation = await db.conversation.create({
    data: { userId: user.id },
  });

  return NextResponse.json({ id: conversation.id });
}

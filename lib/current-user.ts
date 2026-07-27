import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { provisionUser } from "@/lib/provision-user";
import type { User } from "@/app/generated/prisma/client";

export async function requireAppUser(): Promise<{ user: User; email: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  const [clerkUser, existingUser] = await Promise.all([
    currentUser(),
    db.user.findUnique({ where: { clerkId } }),
  ]);

  let user = existingUser;

  if (!user) {
    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    if (!email) {
      // Clerk session exists but hasn't propagated the user's profile yet — rare, transient.
      redirect("/chat/pending");
    }
    user = await provisionUser(clerkId, email);
  }

  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? user.email;
  return { user, email };
}

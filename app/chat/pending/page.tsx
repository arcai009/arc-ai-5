"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 5;
const RETRY_INTERVAL_MS = 3000;

export default function PendingAccountPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) return;
    const timeout = setTimeout(() => {
      setAttempts((n) => n + 1);
      router.refresh();
    }, RETRY_INTERVAL_MS);
    return () => clearTimeout(timeout);
  }, [attempts, router]);

  const gaveUp = attempts >= MAX_ATTEMPTS;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      {gaveUp ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is taking longer than expected setting up your account.
          </p>
          <button
            onClick={() => {
              setAttempts(0);
              router.refresh();
            }}
            className="btn-accent rounded-md px-4 py-2 text-sm font-medium"
          >
            Try again
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Setting up your account&hellip; this page will refresh automatically.
        </p>
      )}
    </main>
  );
}

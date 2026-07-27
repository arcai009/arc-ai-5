"use client";

import { useState } from "react";
import { getLedgerLabel } from "@/lib/ledger-labels";

export type UsageHistoryEntry = {
  id: string;
  delta: number;
  reason: string;
  createdAt: Date | string;
};

function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function Row({ entry }: { entry: UsageHistoryEntry }) {
  const positive = entry.delta > 0;
  return (
    <tr className="border-b border-black/5 last:border-0 dark:border-white/10">
      <td className="py-3 pr-4 text-sm">{getLedgerLabel(entry.reason)}</td>
      <td className="py-3 pr-4 text-sm text-gray-500 dark:text-gray-400">
        {new Date(entry.createdAt).toLocaleString()}
      </td>
      <td
        className={`py-3 text-right text-sm font-medium ${
          positive ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {formatDelta(entry.delta)}
      </td>
    </tr>
  );
}

export function UsageHistoryTable({
  initialEntries,
  hasMore: initialHasMore,
  pageSize,
}: {
  initialEntries: UsageHistoryEntry[];
  hasMore: boolean;
  pageSize: number;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/history?skip=${entries.length}`);
      if (!res.ok) {
        setError("Couldn't load more usage history.");
        return;
      }
      const data: { entries: UsageHistoryEntry[] } = await res.json();
      setEntries((prev) => [...prev, ...data.entries]);
      setHasMore(data.entries.length === pageSize);
    } catch {
      setError("Couldn't load more usage history.");
    } finally {
      setLoading(false);
    }
  }

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No usage yet.</p>;
  }

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-white/15 dark:text-gray-400">
            <th className="pb-2 pr-4 font-medium">Activity</th>
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 text-right font-medium">Credits</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <Row key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-4 rounded-md border border-black/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}

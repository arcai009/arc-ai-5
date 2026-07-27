"use client";

import { useEffect, useState } from "react";

const LOCAL_TOOL_NAMES = ["read_file", "write_file", "run_command"] as const;
type LocalToolName = (typeof LOCAL_TOOL_NAMES)[number];

export function isLocalToolName(name: string): name is LocalToolName {
  return (LOCAL_TOOL_NAMES as readonly string[]).includes(name);
}

function describeAction(toolName: LocalToolName, input: Record<string, unknown>): string {
  if (toolName === "read_file") return `Read ${String(input.path ?? "")}`;
  if (toolName === "write_file") return `Write to ${String(input.path ?? "")}`;
  return `Run: ${String(input.command ?? "")}`;
}

export function ToolPermissionPrompt({
  toolName,
  input,
  autoApproved,
  onResolve,
  onAlwaysAllow,
}: {
  toolName: LocalToolName;
  input: Record<string, unknown>;
  autoApproved: boolean;
  onResolve: (result: { output?: unknown; errorText?: string }) => void;
  onAlwaysAllow: (toolName: string) => void;
}) {
  const [status, setStatus] = useState<"pending" | "running" | "done">(
    autoApproved ? "running" : "pending",
  );
  const [alwaysAllow, setAlwaysAllow] = useState(false);

  useEffect(() => {
    if (autoApproved) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    setStatus("running");
    try {
      if (!window.arcDesktop) throw new Error("Desktop bridge unavailable");
      const result = await window.arcDesktop.executeTool(toolName, input);
      onResolve({ output: result });
    } catch (err) {
      onResolve({ errorText: err instanceof Error ? err.message : "Failed to run tool" });
    } finally {
      setStatus("done");
    }
  }

  function approve() {
    if (alwaysAllow) onAlwaysAllow(toolName);
    void run();
  }

  function deny() {
    onResolve({ errorText: "Permission denied by the user." });
    setStatus("done");
  }

  if (status !== "pending") {
    return (
      <div className="rounded-md border border-black/10 bg-black/[0.03] px-3 py-2 font-mono text-xs text-gray-500 dark:border-white/15 dark:bg-white/[0.03] dark:text-gray-400">
        {describeAction(toolName, input)}
        {status === "running" && <span className="ml-2 animate-pulse">running…</span>}
      </div>
    );
  }

  return (
    <div
      className="rounded-md border px-3 py-3 text-sm"
      style={{ borderColor: "var(--accent-solid)", background: "var(--accent-soft)" }}
    >
      <p className="font-medium">Allow this action on your computer?</p>
      <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-300">
        {describeAction(toolName, input)}
      </p>
      <label className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <input
          type="checkbox"
          checked={alwaysAllow}
          onChange={(e) => setAlwaysAllow(e.target.checked)}
        />
        Always allow {toolName} for this session
      </label>
      <div className="mt-3 flex gap-2">
        <button onClick={approve} className="btn-accent rounded-md px-3 py-1.5 text-xs font-medium">
          Approve
        </button>
        <button
          onClick={deny}
          className="rounded-md border border-black/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Deny
        </button>
      </div>
    </div>
  );
}

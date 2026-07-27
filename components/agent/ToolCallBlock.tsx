interface ToolPartLike {
  type: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  state?: string;
}

function toolLabel(part: ToolPartLike): string {
  if (part.toolName) return part.toolName;
  return part.type.startsWith("tool-") ? part.type.slice(5) : part.type;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function ToolCallBlock({ part }: { part: ToolPartLike }) {
  const name = toolLabel(part);
  const running = part.state === "input-streaming" || part.state === "input-available";

  return (
    <div className="rounded-md border border-black/10 bg-black/[0.03] font-mono text-xs dark:border-white/15 dark:bg-white/[0.03]">
      <div className="border-b border-black/10 px-3 py-1.5 text-gray-500 dark:border-white/15 dark:text-gray-400">
        {name}
        {running && <span className="ml-2 animate-pulse">running…</span>}
      </div>
      {part.input !== undefined && (
        <pre className="overflow-x-auto px-3 py-2 whitespace-pre-wrap">
          {formatValue(part.input)}
        </pre>
      )}
      {part.errorText && (
        <pre className="overflow-x-auto border-t border-black/10 px-3 py-2 whitespace-pre-wrap text-red-600 dark:border-white/15 dark:text-red-400">
          {part.errorText}
        </pre>
      )}
      {part.output !== undefined && (
        <pre className="overflow-x-auto border-t border-black/10 px-3 py-2 whitespace-pre-wrap dark:border-white/15">
          {formatValue(part.output)}
        </pre>
      )}
    </div>
  );
}

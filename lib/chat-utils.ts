import type { UIMessage } from "ai";

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("");
}

interface StepContentPart {
  type: string;
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  error?: unknown;
}

/**
 * Flattens a streamText step's content (text + tool calls/results) into a
 * single readable string for persistence. Live turns render the richer
 * structured UI message parts directly in the client; this is only for
 * reloaded history.
 */
export function serializeStepContent(content: StepContentPart[]): string {
  const blocks: string[] = [];

  for (const part of content) {
    if (part.type === "text" && part.text?.trim()) {
      blocks.push(part.text);
    } else if (part.type === "tool-call" && part.toolName) {
      blocks.push(`[${part.toolName}] ${JSON.stringify(part.input ?? {})}`);
    } else if (part.type === "tool-result" && part.toolName) {
      blocks.push(`→ ${JSON.stringify(part.output, null, 2)}`);
    } else if (part.type === "tool-error" && part.toolName) {
      blocks.push(`→ error: ${JSON.stringify(part.error)}`);
    }
  }

  return blocks.join("\n\n");
}

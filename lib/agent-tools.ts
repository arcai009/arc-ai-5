import { tool } from "ai";
import { z } from "zod";
import type { Sandbox } from "e2b";

export function createAgentTools(sandbox: Sandbox) {
  return {
    read_file: tool({
      description: "Read the contents of a file in the sandbox as text.",
      inputSchema: z.object({
        path: z.string().describe("Absolute or relative path to the file"),
      }),
      execute: async ({ path }) => {
        try {
          const content = await sandbox.files.read(path);
          return { content };
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to read file" };
        }
      },
    }),

    write_file: tool({
      description: "Write text content to a file in the sandbox, creating directories as needed.",
      inputSchema: z.object({
        path: z.string().describe("Absolute or relative path to the file"),
        content: z.string().describe("Text content to write"),
      }),
      execute: async ({ path, content }) => {
        try {
          await sandbox.files.write(path, content);
          return { success: true };
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to write file" };
        }
      },
    }),

    run_command: tool({
      description: "Run a shell command in the sandbox and return its output.",
      inputSchema: z.object({
        command: z.string().describe("Shell command to execute"),
      }),
      execute: async ({ command }) => {
        try {
          const result = await sandbox.commands.run(command, { requestTimeoutMs: 60_000 });
          return {
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr,
          };
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Command failed" };
        }
      },
    }),
  };
}

// Client-resolved tools for the desktop app: same shapes as createAgentTools, but
// omitting `execute` pauses the stream (AI SDK's client-tool behavior) so the
// Electron renderer can run these against the user's own machine after a
// permission prompt, then resume the stream via `addToolResult`.
export function createLocalAgentTools() {
  return {
    read_file: tool({
      description: "Read the contents of a file on the user's computer, within their chosen project folder.",
      inputSchema: z.object({
        path: z.string().describe("Path to the file, relative to the project folder root"),
      }),
    }),

    write_file: tool({
      description:
        "Write text content to a file on the user's computer, within their chosen project folder, creating directories as needed.",
      inputSchema: z.object({
        path: z.string().describe("Path to the file, relative to the project folder root"),
        content: z.string().describe("Text content to write"),
      }),
    }),

    run_command: tool({
      description: "Run a shell command on the user's computer, with its working directory set to the chosen project folder.",
      inputSchema: z.object({
        command: z.string().describe("Shell command to execute"),
      }),
    }),
  };
}

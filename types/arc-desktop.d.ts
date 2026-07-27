export {};

declare global {
  interface ArcDesktopToolResult {
    content?: string;
    success?: boolean;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    error?: string;
  }

  interface ArcDesktopBridge {
    platform: "win32";
    chooseProjectFolder: () => Promise<string | null>;
    getGrantedFolder: () => Promise<string | null>;
    executeTool: (
      name: "read_file" | "write_file" | "run_command",
      input: Record<string, unknown>,
    ) => Promise<ArcDesktopToolResult>;
  }

  interface Window {
    arcDesktop?: ArcDesktopBridge;
  }
}

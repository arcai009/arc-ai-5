import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

interface DesktopConfig {
  projectFolder?: string;
}

function configPath(): string {
  return path.join(app.getPath("userData"), "arc-desktop-config.json");
}

async function readConfig(): Promise<DesktopConfig> {
  try {
    const raw = await fs.readFile(configPath(), "utf-8");
    return JSON.parse(raw) as DesktopConfig;
  } catch {
    return {};
  }
}

async function writeConfig(config: DesktopConfig): Promise<void> {
  await fs.writeFile(configPath(), JSON.stringify(config, null, 2), "utf-8");
}

// Every tool call is resolved against this — anything that would resolve
// outside the granted folder (via `..` or an absolute path) is rejected here,
// so the agent can never touch the rest of the user's disk.
function resolveSafePath(root: string, relativePath: string): string {
  const resolved = path.resolve(root, relativePath);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Path "${relativePath}" escapes the granted project folder.`);
  }
  return resolved;
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const webUrl = process.env.ARC_WEB_URL ?? "http://localhost:3100";
  void win.loadURL(webUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("arc:chooseProjectFolder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled || result.filePaths.length === 0) return null;
  const folder = result.filePaths[0];
  await writeConfig({ projectFolder: folder });
  return folder;
});

ipcMain.handle("arc:getGrantedFolder", async () => {
  const config = await readConfig();
  return config.projectFolder ?? null;
});

ipcMain.handle(
  "arc:executeTool",
  async (_event, name: string, input: Record<string, unknown>) => {
    const config = await readConfig();
    const root = config.projectFolder;
    if (!root) {
      return { error: "No project folder has been granted yet. Choose one in Settings." };
    }

    try {
      if (name === "read_file") {
        const filePath = resolveSafePath(root, String(input.path ?? ""));
        const content = await fs.readFile(filePath, "utf-8");
        return { content };
      }

      if (name === "write_file") {
        const filePath = resolveSafePath(root, String(input.path ?? ""));
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, String(input.content ?? ""), "utf-8");
        return { success: true };
      }

      if (name === "run_command") {
        try {
          const { stdout, stderr } = await execAsync(String(input.command ?? ""), {
            cwd: root,
            timeout: 60_000,
          });
          return { exitCode: 0, stdout, stderr };
        } catch (err) {
          const e = err as { code?: number; stdout?: string; stderr?: string; message?: string };
          return { exitCode: e.code ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? e.message ?? "Command failed" };
        }
      }

      return { error: `Unknown tool: ${name}` };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Tool execution failed" };
    }
  },
);

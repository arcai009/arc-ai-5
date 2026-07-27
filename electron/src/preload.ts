import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("arcDesktop", {
  platform: "win32",
  chooseProjectFolder: () => ipcRenderer.invoke("arc:chooseProjectFolder"),
  getGrantedFolder: () => ipcRenderer.invoke("arc:getGrantedFolder"),
  executeTool: (name: string, input: Record<string, unknown>) =>
    ipcRenderer.invoke("arc:executeTool", name, input),
});

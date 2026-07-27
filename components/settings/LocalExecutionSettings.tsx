"use client";

import { useEffect, useState } from "react";

export function LocalExecutionSettings() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [folder, setFolder] = useState<string | null>(null);

  useEffect(() => {
    if (!window.arcDesktop) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only global (window.arcDesktop) on mount; SSR has no value to pass down instead.
    setIsDesktop(true);
    void window.arcDesktop.getGrantedFolder().then(setFolder);
  }, []);

  if (!isDesktop) return null;

  async function chooseFolder() {
    const picked = await window.arcDesktop!.chooseProjectFolder();
    if (picked) setFolder(picked);
  }

  return (
    <section className="rounded-lg border border-black/10 p-6 dark:border-white/15">
      <h2 className="font-medium">Local execution</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        The desktop app can read, write, and run commands in one folder on this computer. Every
        action is asked for approval first.
      </p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">Granted folder</p>
          <p className="truncate text-sm font-medium">{folder ?? "None yet"}</p>
        </div>
        <button
          onClick={chooseFolder}
          className="shrink-0 rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          {folder ? "Change folder" : "Choose folder"}
        </button>
      </div>
    </section>
  );
}

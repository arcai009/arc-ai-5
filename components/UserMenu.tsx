"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function MenuIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  globe: "M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  help: "M9.5 9a2.5 2.5 0 1 1 3.5 2.288c-.6.276-1 .93-1 1.712v.5M12 17h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6.34 6.34l2.83 2.83M14.83 14.83l2.83 2.83M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};

export function UserMenu({ openUpward = false }: { openUpward?: boolean }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";

  function close() {
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--accent-gradient)" }}
      >
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          className={`absolute left-0 z-50 w-64 overflow-hidden rounded-xl border border-black/10 bg-background py-1.5 shadow-lg dark:border-white/15 ${
            openUpward ? "bottom-9" : "top-9"
          }`}
          role="menu"
        >
          <div className="truncate px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{email}</div>
          <div className="my-1 border-t border-black/10 dark:border-white/15" />

          <Link
            href="/settings"
            onClick={close}
            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            role="menuitem"
          >
            <MenuIcon path={ICONS.settings} />
            Settings
          </Link>
          <div
            className="flex cursor-default items-center justify-between px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
            role="menuitem"
            aria-disabled
          >
            <span className="flex items-center gap-2.5">
              <MenuIcon path={ICONS.globe} />
              Language
            </span>
            <span className="text-xs">English</span>
          </div>
          <Link
            href="/support"
            onClick={close}
            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            role="menuitem"
          >
            <MenuIcon path={ICONS.help} />
            Get help
          </Link>

          <div className="my-1 border-t border-black/10 dark:border-white/15" />

          <Link
            href="/billing"
            onClick={close}
            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            role="menuitem"
          >
            <MenuIcon path={ICONS.spark} />
            View all plans
          </Link>
          <Link
            href="/changelog"
            onClick={close}
            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            role="menuitem"
          >
            <MenuIcon path={ICONS.list} />
            View changelog
          </Link>
          <Link
            href="/terms"
            onClick={close}
            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            role="menuitem"
          >
            <MenuIcon path={ICONS.book} />
            Learn more
          </Link>

          <div className="my-1 border-t border-black/10 dark:border-white/15" />

          <button
            onClick={() => {
              close();
              signOut(() => router.push("/"));
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
            role="menuitem"
          >
            <MenuIcon path={ICONS.logout} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

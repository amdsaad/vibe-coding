"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "@/actions/auth";
import Link from "next/link";

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = email.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-red text-white text-sm font-sans font-bold transition-transform hover:scale-105"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-foreground/10 bg-background shadow-lg animate-slide-down">
          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-mono text-foreground hover:bg-foreground/5 transition-colors"
            >
              Dashboard
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-mono text-foreground hover:bg-foreground/5 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

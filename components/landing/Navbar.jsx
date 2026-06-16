"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user;

  return (
    <nav className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.png" alt="relayed.gg logo" width={38} height={38} className="rounded-full" />
        <span className="font-black">
          relayed<span className="text-violet-400">.gg</span>
        </span>
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        <Link href="/download" className="text-sm font-semibold text-slate-300 hover:text-white">Download</Link>
        <Link href="/support" className="text-sm font-semibold text-slate-300 hover:text-white">Support</Link>
        <Link href="/terms" className="text-sm font-semibold text-slate-300 hover:text-white">Terms</Link>
        <Link href="/privacy" className="text-sm font-semibold text-slate-300 hover:text-white">Privacy</Link>
      </div>

      {status !== "loading" && (
        <>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-black">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>

                <span className="hidden text-sm font-bold sm:block">
                  {user.name || user.email || "Account"}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#080b18] shadow-[0_0_50px_rgba(124,58,237,0.25)]">
                  <div className="border-b border-white/10 px-4 py-4">
                    <p className="font-bold text-white">{user.name || "Relayed User"}</p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                  </div>

                  <div className="p-2">
                    <Link href="/app/me" className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white">
                      Open App
                    </Link>
                    <Link href="/app/settings" className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white">
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-2 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/[0.06] sm:inline-flex">
                Sign In
              </Link>
              <Link href="/register" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold hover:bg-violet-500">
                Get Started
              </Link>
            </div>
          )}
        </>
      )}
    </nav>
  );
}
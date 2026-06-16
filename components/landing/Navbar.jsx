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
    <nav className="relative z-50 mx-auto flex w-full max-w-7xl items-center justify-between py-6">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.png" alt="Relayed" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-black">
          relayed<span className="text-violet-400">.gg</span>
        </span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <Link href="/download" className="text-sm font-bold text-white/80 hover:text-white">Download</Link>
        <Link href="/support" className="text-sm font-bold text-white/80 hover:text-white">Support</Link>
        <Link href="/community" className="text-sm font-bold text-white/80 hover:text-white">Community⌄</Link>
        <Link href="/safety" className="text-sm font-bold text-white/80 hover:text-white">Safety</Link>
        <Link href="/blog" className="text-sm font-bold text-white/80 hover:text-white">Blog</Link>
        <Link href="/developers" className="text-sm font-bold text-white/80 hover:text-white">Developers</Link>
      </div>

      {status !== "loading" && (
        <div className="relative">
          {user ? (
            <>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 hover:bg-white/[0.08]"
              >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-violet-700 font-black">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "R"}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#050712] bg-emerald-400" />
                </div>
                <span className="hidden text-sm font-bold sm:block">
                  {user.name || "Account"}
                </span>
                <span className="text-white/60">⌄</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#080b18] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center gap-3 border-b border-white/10 p-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-violet-700 text-lg font-black">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "R"}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#080b18] bg-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black">{user.name || "Relayed User"}</p>
                      <p className="truncate text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link href="/app/me" className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white">
                      Open App
                    </Link>
                    <Link href="/app/settings" className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white">
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-2 block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-300 hover:bg-red-500/10"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/app/me"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-slate-200"
            >
              Open Relayed
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
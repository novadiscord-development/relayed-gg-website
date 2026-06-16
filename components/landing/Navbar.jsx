"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  const isLoggedIn = status !== "loading" && !!session;

  return (
    <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="relayed.gg logo"
          width={38}
          height={38}
          className="rounded-full"
        />

        <span className="font-black">
          relayed<span className="text-violet-400">.gg</span>
        </span>
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        <Link href="/download" className="text-sm font-semibold text-slate-300 hover:text-white">
          Download
        </Link>
        <Link href="/support" className="text-sm font-semibold text-slate-300 hover:text-white">
          Support
        </Link>
        <Link href="/terms" className="text-sm font-semibold text-slate-300 hover:text-white">
          Terms
        </Link>
        <Link href="/privacy" className="text-sm font-semibold text-slate-300 hover:text-white">
          Privacy
        </Link>
      </div>

      {status !== "loading" && (
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/app/me"
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold transition-colors hover:bg-violet-500"
              >
                Open App
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:bg-white/[0.06]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:bg-white/[0.06] sm:inline-flex"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold transition-colors hover:bg-violet-500"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
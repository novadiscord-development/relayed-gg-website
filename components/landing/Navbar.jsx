"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

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

      {status !== "loading" && (
        <Link
          href={session ? "/app" : "/login"}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold hover:bg-violet-500 transition-colors"
        >
          {session ? "Go to App" : "Get Started"}
        </Link>
      )}
    </nav>
  );
}
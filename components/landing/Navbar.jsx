import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
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

      <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
        <a href="/features" className="hover:text-white">Features</a>
        <a href="/pricing" className="hover:text-white">Pricing</a>
        <a href="/docs" className="hover:text-white">Docs</a>
        <a href="/blog" className="hover:text-white">Blog</a>
        <a href="/support" className="hover:text-white">Support</a>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/[0.06]"
        >
          Sign In
        </Link>

        <Link
          href="/register"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold hover:bg-violet-500"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
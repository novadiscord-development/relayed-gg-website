import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#6d28d955,transparent_35%),radial-gradient(circle_at_bottom_right,#3b076455,transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <Navbar />

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Your community.
              <br />
              Your rules.
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-purple-500 bg-clip-text text-transparent">
                No limits.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              relayed.gg is a modern communication platform built for communities
              that want fast messaging, powerful servers, and complete control.
            </p>

            <div className="mt-8 flex gap-4">
              <Link href="/register" className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-bold shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:from-violet-500 hover:to-purple-500">
                Get Started
              </Link>
              <Link href="/login" className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 font-bold hover:bg-white/[0.06]">
                Sign In
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_80px_rgba(124,58,237,0.18)] backdrop-blur-2xl">
            <div className="rounded-2xl border border-white/10 bg-[#080b18]/80 p-4">
              <div className="flex h-[430px] overflow-hidden rounded-xl border border-white/10 bg-[#070a15]">
                <div className="w-16 border-r border-white/10 bg-white/[0.03] p-3">
                  <Image src="/logo.png" alt="server icon" width={42} height={42} className="rounded-full" />
                </div>

                <div className="w-52 border-r border-white/10 bg-white/[0.03] p-4">
                  <h3 className="font-bold">relayed.gg</h3>
                  <div className="mt-6 space-y-3 text-sm text-slate-400">
                    <p className="rounded-lg bg-violet-600/30 px-3 py-2 text-white"># general</p>
                    <p className="px-3"># announcements</p>
                    <p className="px-3"># rules</p>
                    <p className="px-3"># memes</p>
                  </div>
                </div>

                <div className="flex-1 p-5">
                  <h3 className="border-b border-white/10 pb-4 font-bold"># general</h3>
                  <div className="mt-6 space-y-5 text-sm">
                    <p><span className="font-bold text-violet-300">midnight</span> Welcome to relayed.gg 🎉</p>
                    <p><span className="font-bold text-violet-300">riley</span> This UI is looking clean.</p>
                    <p><span className="font-bold text-violet-300">syntax</span> Let’s build something better.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
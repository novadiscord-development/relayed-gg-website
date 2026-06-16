import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030511] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c3aed55,transparent_32%),radial-gradient(circle_at_bottom_right,#581c8755,transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto max-w-7xl px-6">
        <Navbar />

        <div className="grid min-h-[720px] items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-200">
              ✨ Built for communities, not corporations
            </p>

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
              Relayed.gg is a modern communication platform built for communities
              that want fast messaging, powerful servers, and complete control.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/app/me" className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-4 font-black shadow-[0_0_30px_rgba(124,58,237,0.35)] hover:from-violet-500 hover:to-purple-500">
                Open Relayed
              </Link>
              <Link href="/download" className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 font-black hover:bg-white/[0.06]">
                Download for Windows
              </Link>
            </div>
          </div>

          <AppPreview />
        </div>

        <Stats />

        <Features />

        <GamingSection />

        <CommunitySize />

        <FinalCTA />

        <Footer />
      </section>
    </main>
  );
}

function AppPreview() {
  return (
    <div className="rounded-3xl border border-violet-400/30 bg-white/[0.04] p-4 shadow-[0_0_90px_rgba(124,58,237,0.25)] backdrop-blur-2xl">
      <div className="flex h-[430px] overflow-hidden rounded-2xl border border-white/10 bg-[#070a15]">
        <div className="w-16 border-r border-white/10 bg-black/20 p-3">
          <Image src="/logo.png" alt="server icon" width={42} height={42} className="rounded-xl" />
          <div className="mt-5 space-y-3">
            {["M", "R", "S", "O"].map((x) => (
              <div key={x} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-sm font-black text-slate-300">
                {x}
              </div>
            ))}
          </div>
        </div>

        <div className="w-56 border-r border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-black">relayed.gg</h3>
          <p className="mt-6 text-xs font-bold uppercase text-slate-500">Text Channels</p>
          <div className="mt-3 space-y-3 text-sm text-slate-400">
            <p className="rounded-lg bg-violet-600/50 px-3 py-2 text-white"># general</p>
            <p className="px-3"># announcements</p>
            <p className="px-3"># rules</p>
            <p className="px-3"># memes</p>
          </div>
        </div>

        <div className="flex-1 p-5">
          <h3 className="border-b border-white/10 pb-4 font-black"># general</h3>
          <div className="mt-6 space-y-6 text-sm">
            <Message name="midnight" text="Welcome to relayed.gg 🎉" />
            <Message name="riley" text="This UI is looking clean." />
            <Message name="syntax" text="Let’s build something better." />
            <Message name="orbit" text="The future of comms." />
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({ name, text }) {
  return (
    <p>
      <span className="font-black text-violet-300">{name}</span>{" "}
      <span className="text-slate-300">{text}</span>
    </p>
  );
}

function Stats() {
  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-5">
      {[
        ["99.99%", "Uptime"],
        ["10M+", "Active Users"],
        ["500K+", "Communities"],
        ["∞", "Possibilities"],
        ["24/7", "Support"],
      ].map(([num, label]) => (
        <div key={label} className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-2xl font-black text-violet-300">{num}</p>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}

function Features() {
  return (
    <section className="grid items-center gap-10 py-24 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="mb-4 text-sm font-black uppercase text-violet-300">All the tools you need</p>
        <h2 className="text-4xl font-black md:text-5xl">
          Everything your community needs to{" "}
          <span className="text-violet-400">thrive.</span>
        </h2>
        <p className="mt-5 max-w-xl text-slate-400">
          From text and voice to custom servers and moderation — Relayed gives
          you the tools to build, connect, and grow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {["Text & Voice Chat", "Custom Servers", "Powerful Moderation", "Apps & Integrations"].map((feature) => (
          <div key={feature} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-4 h-10 w-10 rounded-xl bg-violet-600/30" />
            <h3 className="font-black">{feature}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Clean, fast, flexible tools designed for modern communities.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GamingSection() {
  return (
    <section className="grid items-center gap-12 border-t border-white/10 py-24 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-gradient-to-br from-violet-500/30 to-black/30" />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-sm font-black uppercase text-violet-300">Built for gamers</p>
        <h2 className="text-4xl font-black md:text-5xl">
          Fast. Reliable.
          <br />
          Built for <span className="text-violet-400">gamers.</span>
        </h2>
        <ul className="mt-6 space-y-3 text-slate-400">
          <li>✓ Low latency voice and video</li>
          <li>✓ High quality streams</li>
          <li>✓ DDoS protected and always online</li>
          <li>✓ Global network, anywhere you are</li>
        </ul>
      </div>
    </section>
  );
}

function CommunitySize() {
  return (
    <section className="border-t border-white/10 py-24 text-center">
      <p className="mb-4 text-sm font-black uppercase text-violet-300">Communities of any size</p>
      <h2 className="text-4xl font-black md:text-5xl">
        Designed for communities of{" "}
        <span className="text-violet-400">any size.</span>
      </h2>

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {[
          ["Small", "1–50 members"],
          ["Medium", "51–5,000 members"],
          ["Large", "5,001–100,000+ members"],
          ["Enterprise", "Unlimited"],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="font-black">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="my-16 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-violet-950/60 to-black p-10 shadow-[0_0_80px_rgba(124,58,237,0.18)]">
      <h2 className="text-4xl font-black">
        Ready to build something{" "}
        <span className="text-violet-400">amazing?</span>
      </h2>
      <p className="mt-4 max-w-xl text-slate-400">
        Join communities already using Relayed to connect, collaborate, and grow.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/app/me" className="rounded-xl bg-violet-600 px-6 py-3 font-black hover:bg-violet-500">
          Open Relayed
        </Link>
        <Link href="/download" className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 font-black hover:bg-white/[0.06]">
          Download for Windows
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="grid gap-10 border-t border-white/10 py-12 text-sm text-slate-400 md:grid-cols-5">
      <div>
        <p className="text-lg font-black text-white">relayed<span className="text-violet-400">.gg</span></p>
        <p className="mt-3">The modern communication platform for communities.</p>
      </div>

      {["Product", "Resources", "Company", "Legal"].map((group) => (
        <div key={group}>
          <h4 className="font-black text-white">{group}</h4>
          <div className="mt-3 space-y-2">
            <p>Download</p>
            <p>Support</p>
            <p>Blog</p>
            <p>Privacy</p>
          </div>
        </div>
      ))}
    </footer>
  );
}
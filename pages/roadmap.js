import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

const phases = [
  {
    status: "Live",
    title: "Foundation",
    date: "Available now",
    color: "emerald",
    description: "Accounts, servers, channels, and the first version of Relayed are already live.",
    items: ["Accounts", "Servers", "Text channels", "Profiles"],
  },
  {
    status: "Building",
    title: "Desktop App",
    date: "Current focus",
    color: "violet",
    description: "A polished Windows desktop app with native-feeling controls and automatic updates.",
    items: ["Installer", "Desktop detection", "Auto updater", "Startup settings"],
  },
  {
    status: "Next",
    title: "Notifications",
    date: "Coming next",
    color: "blue",
    description: "Discord-style notifications across browser, desktop, and future mobile builds.",
    items: ["Push alerts", "Mentions", "Desktop notifications", "User controls"],
  },
  {
    status: "Planned",
    title: "Voice & Presence",
    date: "Planned",
    color: "purple",
    description: "Voice channels, online presence, richer activity states, and discovery tools.",
    items: ["Voice rooms", "Online status", "Activity", "Discovery"],
  },
];

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030511] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c3aed55,transparent_30%),radial-gradient(circle_at_bottom_right,#312e8155,transparent_35%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto max-w-7xl px-6">
        <Navbar />

        <div className="py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mx-auto mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">
              Relayed Roadmap
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              What we’re building{" "}
              <span className="bg-gradient-to-r from-violet-300 to-purple-500 bg-clip-text text-transparent">
                next.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Follow the major milestones shaping Relayed into a faster,
              cleaner, and more powerful home for online communities.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Stat number="4" label="Major phases" />
            <Stat number="0.1.0" label="Current desktop version" />
            <Stat number="24/7" label="Community focused" />
          </div>

          <div className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_0_100px_rgba(124,58,237,0.18)] backdrop-blur-2xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#080b18]/90 p-6 md:p-10">
              <div className="relative">
                <div className="absolute left-[23px] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-emerald-400 via-violet-400 to-purple-500 md:block" />

                <div className="space-y-8">
                  {phases.map((phase, index) => (
                    <RoadmapItem key={phase.title} phase={phase} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section className="mt-16 grid gap-6 lg:grid-cols-3">
            <InfoCard
              title="Transparent progress"
              text="Roadmap items are shown as clear phases so users know what is live, what is being built, and what comes later."
            />
            <InfoCard
              title="Built around feedback"
              text="Community feedback helps shape priorities, especially around safety, messaging, notifications, and moderation."
            />
            <InfoCard
              title="Stable releases"
              text="Features are shipped carefully so Relayed can grow without breaking the core experience."
            />
          </section>

          <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-950/80 via-[#080b18] to-black p-8 shadow-[0_0_80px_rgba(124,58,237,0.18)] md:p-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <p className="mb-3 text-sm font-black uppercase text-violet-300">
                  Help shape the roadmap
                </p>
                <h2 className="text-4xl font-black">
                  Got an idea for Relayed?
                </h2>
                <p className="mt-4 max-w-2xl leading-8 text-slate-400">
                  Suggest new features, report problems, or tell us what would
                  make your community easier to run.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/support"
                  className="rounded-xl bg-violet-600 px-6 py-3 font-black hover:bg-violet-500"
                >
                  Send Feedback
                </Link>
                <Link
                  href="/app/me"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-black hover:bg-white/[0.08]"
                >
                  Open Relayed
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({ number, label }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
      <p className="text-3xl font-black text-violet-300">{number}</p>
      <p className="mt-2 text-sm font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function RoadmapItem({ phase, index }) {
  const colors = {
    emerald: "bg-emerald-400 text-emerald-200",
    violet: "bg-violet-400 text-violet-200",
    blue: "bg-blue-400 text-blue-200",
    purple: "bg-purple-400 text-purple-200",
  };

  return (
    <div className="relative grid gap-6 md:grid-cols-[56px_1fr]">
      <div className="hidden md:flex">
        <div className={`relative z-10 mt-2 flex h-12 w-12 items-center justify-center rounded-2xl ${colors[phase.color].split(" ")[0]} font-black text-black shadow-[0_0_35px_rgba(124,58,237,0.45)]`}>
          {index + 1}
        </div>
      </div>

      <div className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.055]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className={`rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase ${colors[phase.color].split(" ")[1]}`}>
              {phase.status}
            </span>

            <h2 className="mt-4 text-3xl font-black">{phase.title}</h2>
          </div>

          <p className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-slate-300">
            {phase.date}
          </p>
        </div>

        <p className="mt-4 max-w-3xl leading-8 text-slate-400">
          {phase.description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {phase.items.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-slate-300"
            >
              <span className="mr-2 text-violet-300">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-400/30">
      <div className="mb-5 h-12 w-12 rounded-2xl bg-violet-500/20 shadow-[0_0_30px_rgba(124,58,237,0.25)]" />
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </div>
  );
}
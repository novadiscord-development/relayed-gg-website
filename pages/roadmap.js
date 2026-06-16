import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

const roadmap = [
  {
    status: "Available",
    title: "Core Platform",
    quarter: "Live",
    description: "The foundation of Relayed: accounts, servers, channels, profiles, and realtime communication.",
    items: ["User accounts", "Server spaces", "Text channels", "Profiles"],
  },
  {
    status: "In Development",
    title: "Desktop App",
    quarter: "Now",
    description: "A native Windows experience with installer support, app detection, and automatic updates.",
    items: ["Windows installer", "Auto updater", "Desktop routing", "Startup support"],
  },
  {
    status: "Upcoming",
    title: "Notifications",
    quarter: "Next",
    description: "Reliable notifications across web and desktop so users never miss important activity.",
    items: ["Mentions", "Push alerts", "Desktop alerts", "Notification controls"],
  },
  {
    status: "Planned",
    title: "Voice & Presence",
    quarter: "Later",
    description: "Voice rooms, presence states, activity indicators, and richer community interaction.",
    items: ["Voice channels", "Online status", "Activity states", "Discovery"],
  },
];

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030511] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#5865f233,transparent_38%),radial-gradient(circle_at_bottom_right,#7c3aed33,transparent_35%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:72px_72px]" />

      <section className="relative mx-auto max-w-7xl px-6">
        <Navbar />

        <div className="py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mx-auto mb-5 inline-flex rounded-full border border-[#5865f2]/30 bg-[#5865f2]/10 px-4 py-2 text-sm font-black text-[#c7cdfd]">
              Product Roadmap
            </p>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              Building Relayed with{" "}
              <span className="bg-gradient-to-r from-[#c7cdfd] to-violet-400 bg-clip-text text-transparent">
                clarity.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              A transparent look at what is live, what is actively being built,
              and what is planned next for the Relayed platform.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            <Metric label="Current phase" value="Desktop" />
            <Metric label="Latest version" value="0.1.0" />
            <Metric label="Platform" value="Web + PC" />
            <Metric label="Focus" value="Stability" />
          </div>

          <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0f1d]/90 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 px-6 py-5 md:px-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black">Development timeline</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Milestones are updated as features move through development.
                  </p>
                </div>

                <Link
                  href="/support"
                  className="rounded-full bg-white px-5 py-2 text-sm font-black text-black hover:bg-slate-200"
                >
                  Suggest a feature
                </Link>
              </div>
            </div>

            <div className="divide-y divide-white/10">
              {roadmap.map((item, index) => (
                <RoadmapRow key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            <CorporateCard
              title="Built with users"
              text="Community feedback helps decide what gets prioritized, refined, or reworked."
            />
            <CorporateCard
              title="Released carefully"
              text="Relayed ships in clear stages so new features do not disrupt the existing experience."
            />
            <CorporateCard
              title="Designed to scale"
              text="The platform is being built for small friend groups, creators, gaming servers, and large communities."
            />
          </div>

          <section className="mt-16 rounded-[2rem] border border-white/10 bg-[#5865f2] p-8 text-white shadow-[0_30px_100px_rgba(88,101,242,0.25)] md:p-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tight">
                  Help shape what comes next.
                </h2>
                <p className="mt-4 max-w-2xl leading-8 text-white/80">
                  Share feedback, request features, or tell us what your
                  community needs from Relayed.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/support"
                  className="rounded-full bg-white px-6 py-3 font-black text-black hover:bg-slate-200"
                >
                  Send Feedback
                </Link>
                <Link
                  href="/app/me"
                  className="rounded-full border border-white/20 bg-white/10 px-6 py-3 font-black hover:bg-white/20"
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

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function RoadmapRow({ item, index }) {
  return (
    <div className="grid gap-6 p-6 transition hover:bg-white/[0.025] md:grid-cols-[120px_1fr] md:p-8">
      <div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5865f2]/15 text-xl font-black text-[#c7cdfd]">
          {index + 1}
        </div>
        <p className="mt-4 text-sm font-black uppercase tracking-wide text-slate-500">
          {item.quarter}
        </p>
      </div>

      <div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase text-[#c7cdfd]">
              {item.status}
            </span>
            <h3 className="mt-4 text-3xl font-black">{item.title}</h3>
          </div>
        </div>

        <p className="mt-4 max-w-3xl leading-8 text-slate-400">
          {item.description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {item.items.map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-slate-300"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CorporateCard({ title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b0f1d]/80 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
      <div className="mb-5 h-11 w-11 rounded-2xl bg-[#5865f2]/20" />
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </div>
  );
}
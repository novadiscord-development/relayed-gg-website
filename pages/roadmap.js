import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

const phases = [
  {
    status: "Live",
    title: "Foundation",
    date: "Available now",
    accent: "bg-emerald-400",
    description:
      "The core Relayed experience is live with accounts, servers, channels, and community messaging.",
    items: ["Accounts & auth", "Servers", "Text channels", "Member profiles"],
  },
  {
    status: "Building",
    title: "Desktop Experience",
    date: "Current focus",
    accent: "bg-violet-400",
    description:
      "A native-feeling Windows app with installer support, desktop detection, and release infrastructure.",
    items: ["Windows installer", "Desktop app wrapper", "Auto updater", "Startup options"],
  },
  {
    status: "Next",
    title: "Notifications",
    date: "Up next",
    accent: "bg-blue-400",
    description:
      "Real-time alerts that make Relayed feel alive across web and desktop.",
    items: ["Push notifications", "Desktop notifications", "Mention alerts", "Notification settings"],
  },
  {
    status: "Planned",
    title: "Voice & Presence",
    date: "Planned",
    accent: "bg-purple-400",
    description:
      "Online presence, richer activity states, and voice-first community features.",
    items: ["Online status", "Voice channels", "Activity indicators", "Server discovery"],
  },
];

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030511] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c3aed55,transparent_32%),radial-gradient(circle_at_bottom_right,#581c8755,transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto max-w-7xl px-6">
        <Navbar />

        <div className="py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mx-auto mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">
              Product Roadmap
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              The future of{" "}
              <span className="bg-gradient-to-r from-violet-300 to-purple-500 bg-clip-text text-transparent">
                Relayed.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Track what is live, what is being built, and what is planned next
              as Relayed grows into a powerful community platform.
            </p>
          </div>

          <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_80px_rgba(124,58,237,0.18)] backdrop-blur-2xl">
            <div className="rounded-2xl border border-white/10 bg-[#080b18]/80 p-6 md:p-10">
              <div className="relative">
                <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-violet-400 via-white/10 to-transparent md:block" />

                <div className="space-y-6">
                  {phases.map((phase) => (
                    <div key={phase.title} className="relative grid gap-6 md:grid-cols-[56px_1fr]">
                      <div className="hidden md:flex">
                        <div className={`relative z-10 mt-2 h-10 w-10 rounded-full ${phase.accent} shadow-[0_0_30px_rgba(124,58,237,0.45)]`} />
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-violet-400/30 hover:bg-white/[0.055]">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase text-slate-300">
                              {phase.status}
                            </span>

                            <h2 className="mt-4 text-3xl font-black">
                              {phase.title}
                            </h2>
                          </div>

                          <p className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-200">
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
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-xl font-black">Community-first</h3>
              <p className="mt-3 leading-7 text-slate-400">
                The roadmap is shaped around what communities need most:
                reliability, safety, speed, and control.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-xl font-black">Shipped in stages</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Features are released gradually so Relayed stays stable while
                improving quickly.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-xl font-black">Built transparently</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Users can follow progress, suggest features, and help shape the
                platform.
              </p>
            </div>
          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-violet-950/70 via-[#080b18] to-black p-8 md:p-10">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">
                  Have an idea for Relayed?
                </h2>
                <p className="mt-3 max-w-2xl text-slate-400">
                  Suggest features, report issues, or tell us what would make
                  your community better.
                </p>
              </div>

              <div className="flex gap-3">
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
                  Open App
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
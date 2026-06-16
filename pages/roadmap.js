"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Bell,
  MonitorDown,
  MessageCircle,
  Mic2,
  Rocket,
  Sparkles,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";

const phases = [
  {
    status: "Live",
    title: "Foundation",
    date: "Available now",
    icon: MessageCircle,
    color: "emerald",
    description:
      "The core Relayed experience is live with accounts, servers, channels, and community messaging.",
    items: ["User accounts", "Servers", "Text channels", "Member profiles"],
  },
  {
    status: "Building",
    title: "Desktop Experience",
    date: "Current focus",
    icon: MonitorDown,
    color: "violet",
    description:
      "A native-feeling Windows app with installer support, desktop detection, and release infrastructure.",
    items: ["Windows installer", "Desktop app wrapper", "Auto updater", "Startup options"],
  },
  {
    status: "Next",
    title: "Notifications",
    date: "Up next",
    icon: Bell,
    color: "blue",
    description:
      "Real-time alerts that make Relayed feel alive across web and desktop.",
    items: ["Push notifications", "Desktop notifications", "Mention alerts", "Notification settings"],
  },
  {
    status: "Planned",
    title: "Voice & Presence",
    date: "Planned",
    icon: Mic2,
    color: "purple",
    description:
      "Online presence, richer activity states, and voice-first community features.",
    items: ["Online status", "Voice channels", "Activity indicators", "Server discovery"],
  },
];

const statusStyles = {
  emerald: {
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_35px_rgba(52,211,153,0.35)]",
    badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    icon: "bg-emerald-400/10 text-emerald-300",
  },
  violet: {
    dot: "bg-violet-400",
    glow: "shadow-[0_0_35px_rgba(167,139,250,0.35)]",
    badge: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    icon: "bg-violet-400/10 text-violet-300",
  },
  blue: {
    dot: "bg-[#5865f2]",
    glow: "shadow-[0_0_35px_rgba(88,101,242,0.35)]",
    badge: "border-[#5865f2]/20 bg-[#5865f2]/10 text-[#c7cdfd]",
    icon: "bg-[#5865f2]/10 text-[#c7cdfd]",
  },
  purple: {
    dot: "bg-purple-400",
    glow: "shadow-[0_0_35px_rgba(192,132,252,0.35)]",
    badge: "border-purple-400/20 bg-purple-400/10 text-purple-200",
    icon: "bg-purple-400/10 text-purple-300",
  },
};

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030511] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c3aed55,transparent_30%),radial-gradient(circle_at_bottom_right,#312e8155,transparent_35%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <motion.div
        className="absolute left-20 top-40 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
        animate={{ y: [0, 30, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-40 right-20 h-80 w-80 rounded-full bg-[#5865f2]/20 blur-3xl"
        animate={{ y: [0, -35, 0], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <section className="relative mx-auto max-w-7xl px-6">
        <Navbar />

        <div className="py-20">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">
              <Sparkles size={16} />
              Relayed Roadmap
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              What we’re building{" "}
              <span className="bg-gradient-to-r from-violet-300 to-[#5865f2] bg-clip-text text-transparent">
                next.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Follow the major milestones shaping Relayed into a faster,
              cleaner, and more powerful home for online communities.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid gap-4 md:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            <Stat icon={Rocket} number="4" label="Major phases" />
            <Stat icon={MonitorDown} number="0.1.0" label="Desktop version" />
            <Stat icon={Users} number="Community" label="Driven roadmap" />
            <Stat icon={ShieldCheck} number="Stable" label="Release focus" />
          </motion.div>

          <motion.div
            className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_0_100px_rgba(124,58,237,0.18)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-[1.5rem] border border-white/10 bg-[#080b18]/90 p-6 md:p-10">
              <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-black uppercase text-[#c7cdfd]">
                    Development Timeline
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    From launch to the next generation.
                  </h2>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300">
                  Last updated: January 2025
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-[23px] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-emerald-400 via-[#5865f2] to-purple-500 md:block" />

                <div className="space-y-8">
                  {phases.map((phase, index) => (
                    <RoadmapItem key={phase.title} phase={phase} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <section className="mt-16 grid gap-6 lg:grid-cols-3">
            <InfoCard
              icon={Users}
              title="Community-first"
              text="Feature priorities are shaped around what communities actually need: reliability, control, safety, and speed."
            />
            <InfoCard
              icon={Zap}
              title="Fast releases"
              text="Relayed ships in stages so improvements can roll out quickly without breaking the core experience."
            />
            <InfoCard
              icon={ShieldCheck}
              title="Stable by design"
              text="Every milestone focuses on keeping the platform clean, scalable, and reliable as communities grow."
            />
          </section>

          <motion.section
            className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-950/80 via-[#080b18] to-black p-8 shadow-[0_0_80px_rgba(124,58,237,0.18)] md:p-12"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.55 }}
          >
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
                  className="rounded-xl bg-[#5865f2] px-6 py-3 font-black hover:bg-[#4752c4]"
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
          </motion.section>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, number, label }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0 },
      }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#5865f2]/40 hover:bg-white/[0.06]"
    >
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5865f2]/10 text-[#c7cdfd]">
        <Icon size={22} />
      </div>

      <p className="text-2xl font-black text-white">{number}</p>
      <p className="mt-2 text-sm font-semibold text-slate-400">{label}</p>
    </motion.div>
  );
}

function RoadmapItem({ phase, index }) {
  const styles = statusStyles[phase.color];
  const Icon = phase.icon;

  return (
    <motion.div
      className="relative grid gap-6 md:grid-cols-[56px_1fr]"
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <div className="hidden md:flex">
        <div
          className={`relative z-10 mt-2 flex h-12 w-12 items-center justify-center rounded-2xl ${styles.dot} ${styles.glow} font-black text-black`}
        >
          {index + 1}
        </div>
      </div>

      <div className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#5865f2]/40 hover:bg-white/[0.055]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className={`flex h-13 w-13 items-center justify-center rounded-2xl ${styles.icon} p-3`}>
              <Icon size={24} />
            </div>

            <div>
              <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${styles.badge}`}>
                {phase.status}
              </span>

              <h2 className="mt-4 text-3xl font-black">{phase.title}</h2>
            </div>
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
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-slate-300 transition group-hover:border-white/15"
            >
              <CheckCircle2 size={16} className="text-[#5865f2]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#5865f2]/40"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5865f2]/10 text-[#c7cdfd] shadow-[0_0_30px_rgba(88,101,242,0.25)]">
        <Icon size={24} />
      </div>

      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </motion.div>
  );
}
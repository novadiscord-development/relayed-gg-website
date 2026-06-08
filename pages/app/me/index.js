import ServerBar from "@/components/app/ServerBar";
import DMChannelSidebar from "@/components/dms/DMChannelSidebar";
import { MessageCircle, UserPlus, Users, Inbox } from "lucide-react";
import { motion } from "framer-motion";

export default function MeHomePage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
      <ServerBar />
      <DMChannelSidebar />

      <section className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#6d28d933,transparent_40%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative max-w-2xl px-6 text-center"
        >
          <motion.div
            initial={{ rotate: -8, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_45px_rgba(124,58,237,0.25)] backdrop-blur-xl"
          >
            <MessageCircle size={38} className="text-violet-400" />
          </motion.div>

          <h1 className="text-4xl font-black">
            your relayed<span className="text-violet-400">.gg</span> home
          </h1>

          <p className="mt-4 text-slate-400">
            Friends, direct messages, requests, and private conversations will
            live here.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <button className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
              <Users className="mb-3 text-violet-300" size={22} />
              <p className="font-black text-white">Friends</p>
              <p className="mt-1 text-xs text-slate-500">
                View your friends list.
              </p>
            </button>

            <button className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
              <Inbox className="mb-3 text-violet-300" size={22} />
              <p className="font-black text-white">Requests</p>
              <p className="mt-1 text-xs text-slate-500">
                Friend requests soon.
              </p>
            </button>

            <button className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
              <UserPlus className="mb-3 text-violet-300" size={22} />
              <p className="font-black text-white">Add Friend</p>
              <p className="mt-1 text-xs text-slate-500">
                Search users soon.
              </p>
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
import ServerBar from "@/components/app/ServerBar";
import { MessageCircle, Users, Compass, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function AppHome() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
      <ServerBar />

      <section className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#6d28d933,transparent_40%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative max-w-xl px-6 text-center"
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
            welcome to relayed<span className="text-violet-400">.gg</span>
          </h1>

          <p className="mt-4 text-slate-400">
            Select a server, create a new one, or find friends.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
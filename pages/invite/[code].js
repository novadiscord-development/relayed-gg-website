import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  Users,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { motion } from "framer-motion";

export default function InvitePage() {
  const router = useRouter();
  const { code } = router.query;

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    if (!code) return;
    loadInvite();
  }, [code]);

  async function loadInvite() {
    try {
      const res = await fetch(`/api/invites/${code}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invite not found");
        return;
      }

      setInvite(data.invite);
    } catch {
      setError("Could not load invite");
    } finally {
      setLoading(false);
    }
  }

  async function joinServer() {
    try {
      setJoining(true);
      setError("");
      setNeedsLogin(false);

      const res = await fetch("/api/invites/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }

      if (!res.ok) {
        setError(data.message || "Could not join server");
        return;
      }

      router.push(`/app/server/${data._id}`);
    } finally {
      setJoining(false);
    }
  }

  const server = invite?.serverId;
  const creator = invite?.creatorId;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050712] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.28),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_32%)]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center shadow-[0_0_100px_rgba(124,58,237,0.25)] backdrop-blur-2xl"
      >
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">
          <Sparkles size={14} />
          relayed.gg invite
        </div>

        {loading ? (
          <>
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <h1 className="text-2xl font-black">Loading invite...</h1>
            <p className="mt-3 text-sm text-slate-400">
              Checking this invite link.
            </p>
          </>
        ) : error && !invite ? (
          <>
            <h1 className="text-2xl font-black">Invite Invalid</h1>
            <p className="mt-3 text-slate-400">{error}</p>

            <button
              onClick={() => router.push("/app")}
              className="mt-7 w-full rounded-xl border border-white/10 py-3 font-bold text-slate-300 transition hover:bg-white/[0.06]"
            >
              Back to App
            </button>
          </>
        ) : (
          <>
            <div className="relative mx-auto h-[104px] w-[104px]">
              <div className="absolute inset-0 rounded-[2rem] bg-violet-500/30 blur-2xl" />

              <Image
                src={server?.icon || "/logo.png"}
                alt={server?.name || "Server"}
                width={104}
                height={104}
                className="relative h-[104px] w-[104px] rounded-[2rem] border border-white/10 object-cover shadow-2xl"
              />
            </div>

            <p className="mt-7 text-sm text-slate-400">
              {creator?.username || "Someone"} invited you to join
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {server?.name}
            </h1>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-slate-400">
                <Users size={18} className="mx-auto mb-2 text-violet-300" />
                Community
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-slate-400">
                <ShieldCheck size={18} className="mx-auto mb-2 text-violet-300" />
                Secure invite
              </div>
            </div>

            {needsLogin && (
              <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                You must sign in to join {server?.name}.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {needsLogin ? (
              <button
                onClick={() =>
                  router.push(`/login?callbackUrl=/invite/${code}`)
                }
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500"
              >
                Sign In to Join
                <LogIn size={18} />
              </button>
            ) : (
              <button
                onClick={joinServer}
                disabled={joining}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
              >
                {joining ? "Joining..." : "Accept Invite"}
                {!joining && <ArrowRight size={18} />}
              </button>
            )}

            <button
              onClick={() => router.push("/app")}
              className="mt-3 w-full rounded-xl border border-white/10 py-3 font-bold text-slate-300 transition hover:bg-white/[0.06]"
            >
              Back to App
            </button>
          </>
        )}
      </motion.div>
    </main>
  );
}
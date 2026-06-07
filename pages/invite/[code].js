import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Users, CheckCircle } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const { code } = router.query;

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

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

      const res = await fetch("/api/invites/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not join server");
        return;
      }

      router.push(`/app/server/${data.serverId}`);
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050712] text-white">
        Loading invite...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050712] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-black">Invite Invalid</h1>
          <p className="mt-3 text-slate-400">{error}</p>
        </div>
      </main>
    );
  }

  const server = invite?.serverId;
  const creator = invite?.creatorId;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050712] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_0_80px_rgba(124,58,237,0.2)]">
        <Image
          src={server?.icon || "/logo.png"}
          alt={server?.name || "Server"}
          width={92}
          height={92}
          className="mx-auto h-[92px] w-[92px] rounded-3xl object-cover"
        />

        <p className="mt-6 text-sm text-slate-400">
          {creator?.username || "Someone"} invited you to join
        </p>

        <h1 className="mt-2 text-3xl font-black">{server?.name}</h1>

        <div className="mt-5 flex justify-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <Users size={16} />
            Community Server
          </span>

          <span className="flex items-center gap-2">
            <CheckCircle size={16} />
            Secure Invite
          </span>
        </div>

        <button
          onClick={joinServer}
          disabled={joining}
          className="mt-8 w-full rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {joining ? "Joining..." : "Accept Invite"}
        </button>

        <button
          onClick={() => router.push("/app")}
          className="mt-3 w-full rounded-xl border border-white/10 py-3 font-bold text-slate-300 transition hover:bg-white/[0.06]"
        >
          Back to App
        </button>
      </div>
    </main>
  );
}
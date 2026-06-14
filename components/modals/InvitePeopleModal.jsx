import { useState } from "react";
import { Copy, Link2, X } from "lucide-react";

export default function InvitePeopleModal({ serverId, serverName, onClose }) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function createInvite() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/invites/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not create invite");
        return;
      }

      setInviteUrl(data.url);
    } catch (error) {
      console.error("CREATE_INVITE_ERROR", error);
      setError("Could not create invite");
    } finally {
      setLoading(false);
    }
  }

  async function copyInvite() {
    if (!inviteUrl) return;

    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-4">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0f1d] p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-white">Invite People</h2>
            <p className="mt-1 text-sm text-slate-500">
              Invite friends to {serverName || "this server"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {!inviteUrl ? (
          <button
            type="button"
            onClick={createInvite}
            disabled={loading}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            <Link2 size={18} />
            {loading ? "Creating..." : "Create Invite Link"}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="break-all rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
              {inviteUrl}
            </div>

            <button
              type="button"
              onClick={copyInvite}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500"
            >
              <Copy size={18} />
              {copied ? "Copied!" : "Copy Invite Link"}
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

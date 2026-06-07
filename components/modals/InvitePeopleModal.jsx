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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f1d] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Invite People</h2>
            <p className="mt-1 text-sm text-slate-500">
              Invite friends to {serverName || "this server"}
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {!inviteUrl ? (
          <button
            onClick={createInvite}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            <Link2 size={18} />
            {loading ? "Creating..." : "Create Invite Link"}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
              {inviteUrl}
            </div>

            <button
              onClick={copyInvite}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500"
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
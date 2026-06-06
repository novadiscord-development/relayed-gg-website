import { useState } from "react";
import { X } from "lucide-react";

export default function CreateServerModal({
  isOpen,
  onClose,
  onServerCreated,
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleCreate() {
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/servers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      onServerCreated(data);

      setName("");
      onClose();
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f1d] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">
            Create a Server
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-400">
              Server Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Server"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-bold transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Server"}
          </button>
        </div>
      </div>
    </div>
  );
}
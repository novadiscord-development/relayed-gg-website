import { useState } from "react";
import { X, Save } from "lucide-react";

export default function EditServerModal({ server, onClose, onUpdated }) {
  const [name, setName] = useState(server?.name || "");
  const [icon, setIcon] = useState(server?.icon || "");
  const [description, setDescription] = useState(server?.description || "");
  const [saving, setSaving] = useState(false);

  async function saveServer() {
    if (!name.trim() || saving) return;

    setSaving(true);

    const res = await fetch("/api/servers/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId: server._id,
        name,
        icon,
        description,
      }),
    });

    const data = await res.json();

    setSaving(false);

    if (!res.ok) return;

    onUpdated(data.server);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f1d] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Edit Server</h2>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
              Server Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
              Icon URL
            </label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="/logo.png"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          onClick={saveServer}
          disabled={saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
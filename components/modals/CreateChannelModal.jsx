import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Volume2, Folder } from "lucide-react";

export default function CreateChannelModal({
  isOpen,
  onClose,
  serverId,
  defaultType = "text",
  parentId = null,
  onChannelCreated,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await fetch("/api/channels/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId,
        name,
        type,
        parentId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Something went wrong");
      setLoading(false);
      return;
    }

    onChannelCreated(data.channel);
    setName("");
    setType(defaultType);
    setLoading(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f1d] p-6 shadow-[0_0_70px_rgba(124,58,237,0.25)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Create Channel</h2>

              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "text", label: "Text", icon: Hash },
                  { value: "voice", label: "Voice", icon: Volume2 },
                  { value: "category", label: "Category", icon: Folder },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setType(item.value)}
                      className={`rounded-2xl border p-4 transition ${
                        type === item.value
                          ? "border-violet-400 bg-violet-600/20 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className="mx-auto mb-2" size={20} />
                      <p className="text-xs font-bold">{item.label}</p>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-400">
                  {type === "category" ? "Category Name" : "Channel Name"}
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === "category" ? "information" : "general"}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                disabled={loading || !name.trim()}
                className="w-full rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Channel"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
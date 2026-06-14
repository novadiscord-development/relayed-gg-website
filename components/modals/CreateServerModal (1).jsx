import { useState } from "react";
import { X, Globe2, Lock, Tags } from "lucide-react";

export default function CreateServerModal({
  isOpen,
  onClose,
  onServerCreated,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [publicEnabled, setPublicEnabled] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function cleanTag(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_ ]/g, "")
      .slice(0, 24);
  }

  function addTag(value = tagInput) {
    const clean = cleanTag(value);

    if (!clean) return;

    setTags((prev) => {
      if (prev.includes(clean)) return prev;
      return [...prev, clean].slice(0, 5);
    });

    setTagInput("");
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((item) => item !== tag));
  }

  function resetForm() {
    setName("");
    setDescription("");
    setVisibility("private");
    setPublicEnabled(false);
    setTags([]);
    setTagInput("");
    setError("");
  }

  function closeModal() {
    if (loading) return;

    resetForm();
    onClose?.();
  }

  async function handleCreate() {
    if (!name.trim() || loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/servers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          visibility,
          publicEnabled: visibility === "public" && publicEnabled,
          tags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create server");
        return;
      }

      onServerCreated(data);
      resetForm();
      onClose?.();
    } catch (err) {
      console.error("CREATE_SERVER_MODAL_ERROR", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-4">
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0f1d] p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">
              Create a Server
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Start private, or make your server discoverable in Explore.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-400">
              Server Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="My Awesome Server"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[16px] text-white outline-none placeholder:text-slate-600 focus:border-violet-500 sm:text-sm"
            />

            <p className="mt-1 text-right text-xs text-slate-600">
              {name.length}/80
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-400">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What is this server about?"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[16px] text-white outline-none placeholder:text-slate-600 focus:border-violet-500 sm:text-sm"
            />

            <p className="mt-1 text-right text-xs text-slate-600">
              {description.length}/500
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-400">
              Visibility
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setVisibility("private");
                  setPublicEnabled(false);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  visibility === "private"
                    ? "border-violet-400/40 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock size={17} className="text-slate-300" />
                  <p className="font-black text-white">Private</p>
                </div>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Only people with an invite can join.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVisibility("public");
                  setPublicEnabled(true);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  visibility === "public"
                    ? "border-violet-400/40 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe2 size={17} className="text-violet-300" />
                  <p className="font-black text-white">Public</p>
                </div>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Appears in Explore and users can join.
                </p>
              </button>
            </div>
          </div>

          {visibility === "public" && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-white">Discoverable</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Allow this server to show in Explore.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPublicEnabled((prev) => !prev)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    publicEnabled ? "bg-violet-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      publicEnabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                  <Tags size={14} />
                  Tags
                </label>

                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    disabled={tags.length >= 5}
                    placeholder={
                      tags.length >= 5
                        ? "Maximum 5 tags"
                        : "gaming, friends, coding..."
                    }
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[16px] text-white outline-none placeholder:text-slate-600 disabled:opacity-50 focus:border-violet-500 sm:text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => addTag()}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.length === 0 ? (
                    <p className="text-xs text-slate-600">
                      Add tags to help people find your server.
                    </p>
                  ) : (
                    tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300 transition hover:bg-red-500/10 hover:text-red-300"
                        title="Remove tag"
                      >
                        {tag} ×
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="min-h-[46px] w-full rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Server"}
          </button>
        </div>
      </div>
    </div>
  );
}

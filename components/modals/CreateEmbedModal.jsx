import { useState } from "react";
import { X, Send } from "lucide-react";

export default function CreateEmbedModal({ isOpen, onClose, channelId, onSent }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#7c3aed");
  const [image, setImage] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [footer, setFooter] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  async function sendEmbed(e) {
    e.preventDefault();

    if (sending) return;
    if (!title.trim() && !description.trim()) return;

    try {
      setSending(true);

      const res = await fetch("/api/messages/send-embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          content,
          title,
          description,
          color,
          image,
          thumbnail,
          footer,
        }),
      });

      const data = await res.json();

      if (!res.ok) return;

      onSent?.(data.message);
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <form
        onSubmit={sendEmbed}
        className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1d] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-white">Create Embed</h2>
            <p className="mt-1 text-sm text-slate-500">
              Build a Discord-style embed message.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid max-h-[72vh] gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Message content above embed, optional"
              maxLength={2000}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Embed title"
              maxLength={256}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Embed description"
              maxLength={4096}
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                type="color"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] p-1"
              />

              <input
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="Footer text"
                maxLength={2048}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
              />
            </div>

            <input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="Thumbnail image URL, optional"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Large image URL, optional"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Preview
            </p>

            <div
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="min-w-0 flex-1">
                    {title && (
                      <p className="break-words text-sm font-black text-white">
                        {title}
                      </p>
                    )}

                    {description && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-slate-300">
                        {description}
                      </p>
                    )}
                  </div>

                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                </div>

                {image && (
                  <img
                    src={image}
                    alt=""
                    className="mt-4 max-h-56 w-full rounded-xl object-cover"
                  />
                )}

                {footer && (
                  <p className="mt-4 truncate text-xs text-slate-500">
                    {footer}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-3 font-bold text-slate-300 hover:bg-white/[0.06]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={sending || (!title.trim() && !description.trim())}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            <Send size={17} />
            {sending ? "Sending..." : "Send Embed"}
          </button>
        </div>
      </form>
    </div>
  );
}
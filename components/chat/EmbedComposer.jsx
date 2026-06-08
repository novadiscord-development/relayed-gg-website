import { Send, X } from "lucide-react";
import EmbedCard from "@/components/chat/EmbedCard";

export default function EmbedComposer({
  embed,
  setEmbed,
  emptyEmbed,
  sendingEmbed,
  sendEmbed,
  onClose,
  setPreviewImage,
}) {
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-white">Create Embed</p>
          <p className="text-xs text-slate-500">
            Build an embed directly in chat.
          </p>
        </div>

        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <input
            value={embed.content}
            onChange={(e) => setEmbed({ ...embed, content: e.target.value })}
            placeholder="Optional message above embed"
            maxLength={2000}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
          />

          <input
            value={embed.title}
            onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
            placeholder="Embed title"
            maxLength={256}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
          />

          <textarea
            value={embed.description}
            onChange={(e) =>
              setEmbed({ ...embed, description: e.target.value })
            }
            placeholder="Embed description"
            maxLength={4096}
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
          />

          <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
            <input
              type="color"
              value={embed.color}
              onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/20 p-1"
            />

            <input
              value={embed.footer}
              onChange={(e) => setEmbed({ ...embed, footer: e.target.value })}
              placeholder="Footer"
              maxLength={2048}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>

          <input
            value={embed.thumbnail}
            onChange={(e) => setEmbed({ ...embed, thumbnail: e.target.value })}
            placeholder="Thumbnail URL"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
          />

          <input
            value={embed.image}
            onChange={(e) => setEmbed({ ...embed, image: e.target.value })}
            placeholder="Image URL"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
          />

          <button
            type="button"
            onClick={sendEmbed}
            disabled={
              sendingEmbed || (!embed.title.trim() && !embed.description.trim())
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-black text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            <Send size={16} />
            {sendingEmbed ? "Sending..." : "Send Embed"}
          </button>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Preview
          </p>

          <EmbedCard embed={embed} setPreviewImage={setPreviewImage} />
        </div>
      </div>
    </div>
  );
}
import { Gift, PanelsTopLeft, Plus, Smile } from "lucide-react";

export default function ChatInputBar({
  channel,
  content,
  setContent,
  inputRef,
  fileInputRef,
  uploadingImage,
  editingMessage,
  showEmbedComposer,
  canCreateEmbeds,
  handleContentChange,
  handlePaste,
  setShowEmbedComposer,
  focusInput,
}) {
  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) focusInput();
      }}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
    >
      <button
        type="button"
        disabled={uploadingImage || !!editingMessage || showEmbedComposer}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={18} />
      </button>

      <input
        ref={inputRef}
        value={content}
        onChange={handleContentChange}
        onPaste={handlePaste}
        disabled={!!editingMessage || showEmbedComposer}
        placeholder={
          uploadingImage
            ? "Uploading image..."
            : showEmbedComposer
            ? "Finish or close embed composer"
            : `Message #${channel?.name || "channel"}`
        }
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
      />

      <div className="flex shrink-0 items-center gap-3 text-slate-400">
        <Gift size={19} className="cursor-pointer transition hover:text-white" />

        {canCreateEmbeds && (
          <button
            type="button"
            onClick={() => setShowEmbedComposer((prev) => !prev)}
            className={`transition ${
              showEmbedComposer ? "text-violet-300" : "hover:text-violet-300"
            }`}
            title="Create Embed"
          >
            <PanelsTopLeft size={18} />
          </button>
        )}

        <Smile size={19} className="cursor-pointer transition hover:text-white" />
      </div>
    </div>
  );
}
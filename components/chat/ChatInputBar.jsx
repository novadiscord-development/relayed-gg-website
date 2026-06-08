import { Gift, PanelsTopLeft, Plus, Smile } from "lucide-react";

export default function ChatInputBar({
  channel,
  content,
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
  sendMessage,
}) {
  function handleKeyDown(e) {
    if (e.key !== "Enter") return;

    if (e.shiftKey) return;

    e.preventDefault();
    sendMessage(e);
  }

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) focusInput();
      }}
      className="flex items-end gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
    >
      <button
        type="button"
        disabled={uploadingImage || !!editingMessage || showEmbedComposer}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={18} />
      </button>

      <textarea
        ref={inputRef}
        value={content}
        onChange={handleContentChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={!!editingMessage || showEmbedComposer}
        placeholder={
          uploadingImage
            ? "Uploading image..."
            : showEmbedComposer
            ? "Finish or close embed composer"
            : `Message #${channel?.name || "channel"}`
        }
        className="max-h-36 min-h-[32px] min-w-0 flex-1 resize-none bg-transparent py-1 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
      />

      <div className="mb-1.5 flex shrink-0 items-center gap-3 text-slate-400">
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
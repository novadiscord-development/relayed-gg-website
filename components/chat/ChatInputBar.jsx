import { Gift, PanelsTopLeft, Plus, Smile, Send } from "lucide-react";

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

  const canSend =
    !uploadingImage &&
    !editingMessage &&
    !showEmbedComposer &&
    content.trim().length > 0;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) focusInput();
      }}
      className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 md:gap-3 md:rounded-xl md:px-4 md:py-3"
    >
      <button
        type="button"
        disabled={uploadingImage || !!editingMessage || showEmbedComposer}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 transition hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:h-8 md:w-8"
        aria-label="Add attachment"
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
        className="max-h-32 min-h-[36px] min-w-0 flex-1 resize-none bg-transparent py-1.5 text-[16px] leading-6 text-white outline-none placeholder:text-slate-500 disabled:opacity-50 md:max-h-36 md:min-h-[32px] md:text-sm"
      />

      <div className="mb-1.5 hidden shrink-0 items-center gap-3 text-slate-400 sm:flex">
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

      {canCreateEmbeds && (
        <button
          type="button"
          onClick={() => setShowEmbedComposer((prev) => !prev)}
          className={`mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 transition sm:hidden ${
            showEmbedComposer
              ? "bg-violet-500/20 text-violet-200"
              : "bg-white/[0.04] text-slate-300"
          }`}
          title="Create Embed"
          aria-label="Create embed"
        >
          <PanelsTopLeft size={17} />
        </button>
      )}

      <button
        type="button"
        onClick={sendMessage}
        disabled={!canSend}
        className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500 md:hidden"
        aria-label="Send message"
      >
        <Send size={17} />
      </button>
    </div>
  );
}

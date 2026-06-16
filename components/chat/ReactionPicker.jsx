const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡", "🔥", "🎉"];

export default function ReactionPicker({ message, onToggleReaction, onClose }) {
  async function handleReaction(emoji) {
    await onToggleReaction?.(message, emoji);
    onClose?.();
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
      <div className="grid grid-cols-4 gap-1">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleReaction(emoji)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition hover:bg-white/[0.08]"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
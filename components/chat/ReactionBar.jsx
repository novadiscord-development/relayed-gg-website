const QUICK_REACTIONS = ["👍", "❤️", "😂", "🔥", "😭", "💀", "👀", "🎉"];

export default function ReactionBar({ message, session, onToggleReaction }) {
  const reactions = message.reactions || [];

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {reactions.map((reaction) => {
        const reacted = reaction.userIds?.some(
          (id) => id.toString() === session?.user?.id?.toString()
        );

        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => onToggleReaction(message, reaction.emoji)}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold transition ${
              reacted
                ? "border-violet-400/50 bg-violet-500/20 text-violet-100"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
            }`}
          >
            <span>{reaction.emoji}</span>
            <span>{reaction.userIds?.length || 0}</span>
          </button>
        );
      })}

      <div className="hidden gap-1 opacity-0 transition group-hover:flex group-hover:opacity-100">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggleReaction(message, emoji)}
            className="rounded-full border border-white/10 bg-[#111827] px-2 py-1 text-xs transition hover:scale-110 hover:bg-white/[0.08]"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
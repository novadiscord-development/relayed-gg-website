export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers?.length) return null;

  const names = typingUsers.map((user) => user.username);
  const text =
    names.length === 1 ? `${names[0]} is typing` : "Several people are typing";

  return (
    <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
      </div>

      <span>
        <span className="font-semibold text-slate-300">{text}</span>
        <span className="text-slate-500">...</span>
      </span>
    </div>
  );
}
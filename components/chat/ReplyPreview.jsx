export default function ReplyPreview({ reply, openUserProfile }) {
  if (!reply) return null;

  return (
    <div className="mb-1 flex max-w-full items-center gap-2 text-xs text-slate-500">
      <span className="text-slate-600">↳</span>

      <button
        type="button"
        onClick={() => openUserProfile(reply.authorId)}
        className="shrink-0 font-semibold text-slate-400 hover:text-white hover:underline"
      >
        {reply.authorId?.username || "Unknown User"}
      </button>

      <span className="truncate text-slate-500">
        {reply.content || "Original message unavailable"}
      </span>
    </div>
  );
}
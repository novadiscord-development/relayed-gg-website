import { X } from "lucide-react";

export default function ReplyBar({ replyingTo, openUserProfile, onCancel }) {
  if (!replyingTo) return null;

  return (
    <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          Replying to{" "}
          <button
            type="button"
            onClick={() => openUserProfile(replyingTo.authorId)}
            className="font-semibold text-violet-300 hover:underline"
          >
            {replyingTo.authorId?.username || "Unknown User"}
          </button>
        </p>

        <p className="truncate text-sm text-slate-300">
          {replyingTo.content}
        </p>
      </div>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onCancel}
        className="ml-3 text-slate-500 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
  );
}
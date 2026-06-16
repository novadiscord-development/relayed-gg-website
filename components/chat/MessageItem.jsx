import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Copy, Pencil, Pin, Reply, Smile, Trash2 } from "lucide-react";
import ReplyPreview from "@/components/chat/ReplyPreview";
import MessageAttachments from "@/components/chat/MessageAttachments";
import EmbedCard from "@/components/chat/EmbedCard";
import FormattedMessage from "@/components/chat/FormattedMessage";
import ReactionBar from "@/components/chat/ReactionBar";
import ReactionPicker from "@/components/chat/ReactionBar";

export default function MessageItem({
  message,
  previousMessage,
  session,
  currentMember,
  editingMessage,
  editContent,
  setEditContent,
  highlightedMessageId,
  setEditingMessage,
  setReplyingTo,
  messageRefs,
  getAuthorId,
  formatTime,
  openUserProfile,
  startReply,
  handleSaveEdit,
  handleDeleteMessage,
  cancelEdit,
  setPreviewImage,
  onToggleReaction,
  onTogglePin,
}) {
  const author = message.authorId;
  const isEditing = editingMessage?._id === message._id;

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const actionBarRef = useRef(null);

  useEffect(() => {
    if (!showReactionPicker) return;

    function handleMouseDown(event) {
      if (actionBarRef.current?.contains(event.target)) return;
      setShowReactionPicker(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowReactionPicker(false);
      }
    }

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showReactionPicker]);

  async function copyMessage() {
    if (!message.content) return;

    try {
      await navigator.clipboard.writeText(message.content);
    } catch (error) {
      console.error("COPY_MESSAGE_ERROR", error);
    }
  }

  const grouped =
    previousMessage &&
    !previousMessage.system &&
    !message.system &&
    !message.replyToId &&
    getAuthorId(previousMessage) === getAuthorId(message);

  const isAuthor = getAuthorId(message) === session?.user?.id;
  const canModerateMessages = ["owner", "admin", "moderator"].includes(
    currentMember?.role
  );

  const hasReactions = (message.reactions || []).length > 0;

  if (message.system) {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="max-w-[70%] text-center text-sm text-slate-500">
          {message.content}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    );
  }

  return (
    <div
      ref={(el) => {
        if (el) messageRefs.current[message._id] = el;
      }}
      className={`group relative flex gap-4 rounded-lg px-2 transition ${
        highlightedMessageId === message._id
          ? "bg-yellow-500/15 ring-1 ring-yellow-400/40"
          : isEditing
          ? "bg-white/5"
          : "hover:bg-white/4"
      } ${grouped ? "py-px" : "py-2"}`}
    >
      {!isEditing && (
        <div
          ref={actionBarRef}
          className="absolute right-4 top-0 z-40 hidden -translate-y-1/2 overflow-visible rounded-lg border border-white/10 bg-[#111827] shadow-xl group-hover:flex"
        >
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowReactionPicker((prev) => !prev)}
              className={`p-2 hover:bg-white/[0.06] ${
                showReactionPicker
                  ? "text-violet-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Add reaction"
            >
              <Smile size={16} />
            </button>

            {showReactionPicker && (
              <ReactionPicker
                message={message}
                onToggleReaction={onToggleReaction}
                onClose={() => setShowReactionPicker(false)}
              />
            )}
          </div>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => startReply(message)}
            className="p-2 text-slate-400 hover:bg-white/6 hover:text-white"
            title="Reply"
          >
            <Reply size={16} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={copyMessage}
            className="p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
            title="Copy message"
          >
            <Copy size={16} />
          </button>

          {canModerateMessages && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onTogglePin?.(message)}
              className={`p-2 hover:bg-white/[0.06] ${
                message.pinned
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title={message.pinned ? "Unpin message" : "Pin message"}
            >
              <Pin size={16} />
            </button>
          )}

          {isAuthor && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setEditingMessage(message);
                setEditContent(message.content || "");
                setReplyingTo(null);
                setShowReactionPicker(false);
              }}
              className="p-2 text-slate-400 hover:bg-white/6 hover:text-white"
              title="Edit message"
            >
              <Pencil size={16} />
            </button>
          )}

          {(isAuthor || canModerateMessages) && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowReactionPicker(false);
                handleDeleteMessage(message);
              }}
              className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              title="Delete message"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {grouped ? (
        <div className="w-11 shrink-0 text-right text-[10px] text-slate-600 opacity-0 transition group-hover:opacity-100">
          {formatTime(message.createdAt)}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openUserProfile(author)}
          className="h-11 w-11 shrink-0"
        >
          <Image
            src={author?.avatar || "/logo.png"}
            alt={author?.username || "User"}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full transition hover:opacity-80"
          />
        </button>
      )}

      <div className="min-w-0 flex-1">
        {message.replyToId && (
          <ReplyPreview
            reply={message.replyToId}
            openUserProfile={openUserProfile}
          />
        )}

        {!grouped && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openUserProfile(author)}
              className="font-bold text-violet-300 hover:underline"
            >
              {author?.username || "Unknown User"}
            </button>

            {author?.isStaff && (
              <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-black">
                RELAYED
              </span>
            )}

            {author?.isAdmin && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black">
                ADMIN
              </span>
            )}

            <span className="text-xs text-slate-500">
              {formatTime(message.createdAt)}
            </span>

            {message.edited && !isEditing && (
              <span className="text-xs text-slate-500">edited</span>
            )}
          </div>
        )}

        {message.pinned && !isEditing && (
          <div className={grouped ? "mb-1" : "mt-1 mb-1"}>
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">
              <Pin size={12} />
              Pinned
            </span>
          </div>
        )}

        {isEditing ? (
          <div className={grouped ? "mt-0" : "mt-2"}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelEdit();

                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
              }}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0f1d] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              escape to{" "}
              <button
                type="button"
                onClick={cancelEdit}
                className="text-blue-400 hover:underline"
              >
                cancel
              </button>{" "}
              • enter to{" "}
              <button
                type="button"
                onClick={handleSaveEdit}
                className="text-blue-400 hover:underline"
              >
                save
              </button>
            </p>
          </div>
        ) : (
          <>
            {message.content && (
              <div className="mt-0">
                <FormattedMessage content={message.content} />

                {message.edited && grouped && (
                  <span className="ml-2 text-xs text-slate-500">edited</span>
                )}
              </div>
            )}

            <MessageAttachments
              message={message}
              setPreviewImage={setPreviewImage}
            />

            {message.embeds?.length > 0 && (
              <div className="space-y-2">
                {message.embeds.map((embed, embedIndex) => (
                  <EmbedCard
                    key={`${message._id}-embed-${embedIndex}`}
                    embed={embed}
                    setPreviewImage={setPreviewImage}
                  />
                ))}
              </div>
            )}

            {hasReactions && (
              <ReactionBar
                message={message}
                session={session}
                onToggleReaction={onToggleReaction}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
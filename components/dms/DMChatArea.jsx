import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Plus, Gift, Smile, Reply, X, Pencil, Trash2, Check } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import UserProfilePopout from "@/components/users/UserProfilePopout";

export default function DMChatArea() {
  const router = useRouter();
  const { conversationId } = router.query;
  const { data: session } = useSession();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const stopTypingTimeoutRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  const [attachments, setAttachments] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [presence, setPresence] = useState({
    status: "offline",
    customStatus: "",
  });

  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;

    setMessages([]);
    setReplyingTo(null);
    setSelectedUser(null);
    setEditingMessage(null);
    setEditContent("");
    setTypingUsers({});
    setAttachments([]);
    setPreviewImage(null);
    setPresence({ status: "offline", customStatus: "" });

    loadConversation();
    loadMessages();

    requestAnimationFrame(() => inputRef.current?.focus());
  }, [conversationId, session?.user?.id]);

  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;

    const pusherClient = getPusherClient();
    const pusherChannel = pusherClient.subscribe(`dm-${conversationId}`);

    function handleNewMessage(message) {
      setMessages((prev) =>
        prev.some((item) => item._id === message._id)
          ? prev
          : [...prev, message]
      );
    }

    function handleUpdatedMessage(updatedMessage) {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message
        )
      );
    }

    function handleDeletedMessage({ messageId }) {
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId)
      );

      if (replyingTo?._id === messageId) setReplyingTo(null);

      if (editingMessage?._id === messageId) {
        setEditingMessage(null);
        setEditContent("");
      }
    }

    function handleTypingStart(user) {
      if (sameId(user.userId, session.user.id)) return;

      setTypingUsers((prev) => ({
        ...prev,
        [user.userId]: user.username || "Someone",
      }));

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers({});
      }, 3500);
    }

    function handleTypingStop(user) {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[user.userId];
        return next;
      });
    }

    pusherChannel.bind("dm:message:new", handleNewMessage);
    pusherChannel.bind("dm:message:update", handleUpdatedMessage);
    pusherChannel.bind("dm:message:delete", handleDeletedMessage);
    pusherChannel.bind("dm:typing:start", handleTypingStart);
    pusherChannel.bind("dm:typing:stop", handleTypingStop);

    return () => {
      pusherChannel.unbind("dm:message:new", handleNewMessage);
      pusherChannel.unbind("dm:message:update", handleUpdatedMessage);
      pusherChannel.unbind("dm:message:delete", handleDeletedMessage);
      pusherChannel.unbind("dm:typing:start", handleTypingStart);
      pusherChannel.unbind("dm:typing:stop", handleTypingStop);
      pusherClient.unsubscribe(`dm-${conversationId}`);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(stopTypingTimeoutRef.current);
    };
  }, [conversationId, session?.user?.id, replyingTo?._id, editingMessage?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    fetch("/api/dms/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {});
  }, [conversationId]);

  function sameId(a, b) {
    return (a || "").toString() === (b || "").toString();
  }

  function getUserId(user) {
    return (user?._id || user?.id || user || "").toString();
  }

  function getAuthorId(message) {
    return getUserId(message?.authorId);
  }

  function getOtherUserFromConversation(current = conversation) {
    return current?.participants?.find(
      (user) => !sameId(getUserId(user), session?.user?.id)
    );
  }

  function getPresenceLabel() {
    if (presence.customStatus?.trim()) return presence.customStatus.trim();
    if (presence.status === "online") return "Online";
    if (presence.status === "idle") return "Idle";
    if (presence.status === "dnd") return "Do Not Disturb";
    return "Offline";
  }

  function getPresenceColor() {
    if (presence.status === "online") return "bg-green-500";
    if (presence.status === "idle") return "bg-yellow-400";
    if (presence.status === "dnd") return "bg-red-500";
    return "bg-slate-600";
  }

  function getTypingText() {
    const names = Object.values(typingUsers);
    if (!names.length) return "";
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return "Several people are typing...";
  }

  function getSelectedUserPresence() {
    const otherUser = getOtherUserFromConversation();

    return sameId(getUserId(selectedUser), getUserId(otherUser))
      ? presence
      : { status: "offline", customStatus: "" };
  }

  function focusInput() {
    if (
      selectedUser ||
      editingMessage ||
      document.activeElement === inputRef.current
    ) {
      return;
    }

    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function emitTyping(typing) {
    if (!conversationId) return;

    fetch("/api/dms/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, typing }),
    }).catch(() => {});
  }

  function handleContentChange(e) {
    setContent(e.target.value);

    if (!e.target.value.trim() || editingMessage) {
      emitTyping(false);
      return;
    }

    emitTyping(true);

    clearTimeout(stopTypingTimeoutRef.current);
    stopTypingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1600);
  }

  async function uploadChatImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB.");
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/chat-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Image upload failed");
        return;
      }

      setAttachments((prev) => [...prev, data.attachment]);
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      console.error("UPLOAD_DM_IMAGE_ERROR", error);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    await uploadChatImage(file);
  }

  async function handlePaste(e) {
    if (editingMessage || uploadingImage) return;

    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (!imageItem) return;

    const file = imageItem.getAsFile();

    if (!file) return;

    e.preventDefault();

    await uploadChatImage(file);
  }

  async function loadConversation() {
    try {
      const res = await fetch("/api/dms/get-conversations");
      const data = await res.json();

      if (!res.ok) return;

      const current = (data.conversations || []).find((item) =>
        sameId(item._id, conversationId)
      );

      setConversation(current || null);

      const otherUser = getOtherUserFromConversation(current);

      if (otherUser) {
        await loadPresence(getUserId(otherUser));
      }
    } catch (error) {
      console.error("LOAD_DM_CONVERSATION_ERROR", error);
    }
  }

  async function loadPresence(userId) {
    try {
      const res = await fetch(`/api/presence/get-user?userId=${userId}`);
      const data = await res.json();

      if (res.ok) {
        setPresence({
          status: data.status || "offline",
          customStatus: data.customStatus || "",
        });
      }
    } catch (error) {
      console.error("LOAD_DM_PRESENCE_ERROR", error);
    }
  }

  async function loadMessages() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/dms/get-messages?conversationId=${conversationId}`
      );
      const data = await res.json();

      if (res.ok) setMessages(data.messages || []);
    } catch (error) {
      console.error("LOAD_DM_MESSAGES_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  function startReply(message) {
    setReplyingTo(message);
    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  function startEdit(message) {
    setEditingMessage(message);
    setEditContent(message.content || "");
    setReplyingTo(null);
    emitTyping(false);
  }

  function cancelEdit() {
    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  async function handleSaveEdit() {
    if (!editingMessage || !editContent.trim()) return;

    const res = await fetch("/api/dms/update-message", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: editingMessage._id,
        content: editContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) return;

    setMessages((prev) =>
      prev.map((message) =>
        message._id === data.message._id ? data.message : message
      )
    );

    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  async function handleDeleteMessage(message) {
    if (!confirm("Delete this message?")) {
      focusInput();
      return;
    }

    const res = await fetch("/api/dms/delete-message", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: message._id }),
    });

    if (!res.ok) return;

    setMessages((prev) => prev.filter((item) => item._id !== message._id));

    if (replyingTo?._id === message._id) setReplyingTo(null);

    if (editingMessage?._id === message._id) {
      setEditingMessage(null);
      setEditContent("");
    }

    focusInput();
  }

  async function sendMessage(e) {
    e.preventDefault();

    if ((!content.trim() && attachments.length === 0) || sending || editingMessage) {
      focusInput();
      return;
    }

    const messageContent = content;
    const messageAttachments = attachments;
    const replyToId = replyingTo?._id || null;

    setSending(true);
    setContent("");
    setAttachments([]);
    setReplyingTo(null);
    emitTyping(false);
    focusInput();

    try {
      const res = await fetch("/api/dms/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
          replyToId,
          attachments: messageAttachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setContent(messageContent);
        setAttachments(messageAttachments);
        setReplyingTo(replyingTo);
        return;
      }

      setMessages((prev) =>
        prev.some((item) => item._id === data.message._id)
          ? prev
          : [...prev, data.message]
      );
    } catch (error) {
      console.error("SEND_DM_MESSAGE_ERROR", error);
      setContent(messageContent);
      setAttachments(messageAttachments);
      setReplyingTo(replyingTo);
    } finally {
      setSending(false);
      focusInput();
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleString([], {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  function ReplyPreview({ reply }) {
    if (!reply) return null;

    return (
      <div className="mb-1 flex max-w-full items-center gap-2 text-xs text-slate-500">
        <span className="text-slate-600">↳</span>

        <button
          type="button"
          onClick={() => setSelectedUser(reply.authorId)}
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

  function MessageAttachments({ message }) {
    const messageAttachments = message.attachments || [];

    if (!messageAttachments.length) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {messageAttachments.map((attachment, index) => {
          if (attachment.type !== "image") return null;

          return (
            <button
              key={`${attachment.url}-${index}`}
              type="button"
              onClick={() => setPreviewImage(attachment.url)}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/20 transition hover:opacity-90"
            >
              <img
                src={attachment.url}
                alt={attachment.name || "Uploaded image"}
                className="max-h-[320px] max-w-[420px] object-contain"
              />
            </button>
          );
        })}
      </div>
    );
  }

  const otherUser = getOtherUserFromConversation();
  const typingText = getTypingText();

  return (
    <>
      <section
        onPaste={handlePaste}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#080b18]"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[#080b18] px-6">
          <div className="relative shrink-0">
            <Image
              src={otherUser?.avatar || otherUser?.image || "/logo.png"}
              alt={otherUser?.username || "User"}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />

            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#080b18] ${getPresenceColor()}`}
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-black text-white">
              {otherUser?.username || otherUser?.name || "Direct Message"}
            </h1>

            <p className="truncate text-xs text-slate-500">
              {getPresenceLabel()}
            </p>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="relative mb-4 h-[72px] w-[72px]">
              <Image
                src={otherUser?.avatar || otherUser?.image || "/logo.png"}
                alt={otherUser?.username || "User"}
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-full object-cover"
              />

              <span
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#101422] ${getPresenceColor()}`}
              />
            </div>

            <h2 className="text-3xl font-black">
              {otherUser?.username || otherUser?.name || "Direct Message"}
            </h2>

            <p className="mt-2 text-slate-400">
              This is the beginning of your direct message history.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500">No messages yet. Say hello.</p>
          ) : (
            <div className="space-y-0">
              {messages.map((message, index) => {
                const author = message.authorId;
                const previousMessage = messages[index - 1];

                const grouped =
                  previousMessage &&
                  !message.replyToId &&
                  getAuthorId(previousMessage) === getAuthorId(message);

                const isAuthor = sameId(getAuthorId(message), session?.user?.id);
                const isEditing = editingMessage?._id === message._id;

                return (
                  <div
                    key={message._id}
                    className={`group relative flex gap-4 rounded-lg px-2 transition ${
                      grouped ? "py-[1px]" : "py-2"
                    } ${
                      isEditing ? "bg-white/[0.05]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    {!isEditing && (
                      <div className="absolute right-4 top-0 hidden -translate-y-1/2 overflow-hidden rounded-lg border border-white/10 bg-[#111827] shadow-xl group-hover:flex">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => startReply(message)}
                          className="p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Reply size={16} />
                        </button>

                        {isAuthor && (
                          <>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => startEdit(message)}
                              className="p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleDeleteMessage(message)}
                              className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
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
                        onClick={() => setSelectedUser(author)}
                        className="h-11 w-11 shrink-0"
                      >
                        <Image
                          src={author?.avatar || author?.image || "/logo.png"}
                          alt={author?.username || "User"}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover transition hover:opacity-80"
                        />
                      </button>
                    )}

                    <div className="min-w-0 flex-1">
                      {message.replyToId && <ReplyPreview reply={message.replyToId} />}

                      {!grouped && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(author)}
                            className="font-bold text-violet-300 hover:underline"
                          >
                            {author?.username || "Unknown User"}
                          </button>

                          {message.systemBot && (
                            <span className="inline-flex items-center gap-1 rounded bg-[#5865F2] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                              APP
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}

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
                            <p className="whitespace-pre-wrap break-words leading-[1.375rem] text-slate-100">
                              {message.content}

                              {message.edited && grouped && (
                                <span className="ml-2 text-xs text-slate-500">
                                  edited
                                </span>
                              )}
                            </p>
                          )}

                          <MessageAttachments message={message} />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          onMouseDown={(e) => e.stopPropagation()}
          className="relative shrink-0 border-t border-white/10 bg-[#080b18] p-4"
        >
          {typingText && !editingMessage && (
            <div className="mb-2 px-2 text-xs font-semibold text-slate-500 animate-in fade-in slide-in-from-bottom-1 duration-150">
              {typingText}
            </div>
          )}

          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.url}-${index}`}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30"
                >
                  <img
                    src={attachment.url}
                    alt={attachment.name || "Image preview"}
                    className="h-24 w-24 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-500"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {replyingTo && (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-400">
                  Replying to{" "}
                  <button
                    type="button"
                    onClick={() => setSelectedUser(replyingTo.authorId)}
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
                onClick={() => {
                  setReplyingTo(null);
                  focusInput();
                }}
                className="ml-3 text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <div
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) focusInput();
            }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
          >
            <button
              type="button"
              disabled={uploadingImage || !!editingMessage}
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
              disabled={!!editingMessage}
              placeholder={
                uploadingImage
                  ? "Uploading image..."
                  : editingMessage
                  ? "Finish editing your message"
                  : `Message ${otherUser?.username || ""}`
              }
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
            />

            <div className="flex shrink-0 items-center gap-3 text-slate-400">
              <Gift size={19} className="cursor-pointer transition hover:text-white" />
              <Smile size={19} className="cursor-pointer transition hover:text-white" />
            </div>
          </div>
        </form>
      </section>

      {selectedUser && (
        <UserProfilePopout
          user={selectedUser}
          member={null}
          presence={getSelectedUserPresence()}
          onClose={() => {
            setSelectedUser(null);
            focusInput();
          }}
        />
      )}

      {previewImage && (
        <div
          onMouseDown={() => setPreviewImage(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
        >
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            className="max-h-full max-w-full"
          >
            <img
              src={previewImage}
              alt="Image preview"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
          </button>
        </div>
      )}
    </>
  );
}
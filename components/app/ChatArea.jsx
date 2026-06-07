import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Plus,
  Gift,
  Smile,
  Pencil,
  Trash2,
  Reply,
  X,
  PanelsTopLeft,
  Send,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

const emptyEmbed = {
  content: "",
  title: "",
  description: "",
  color: "#7c3aed",
  image: "",
  thumbnail: "",
  footer: "",
};

export default function ChatArea() {
  const router = useRouter();
  const { serverId, channelId } = router.query;
  const { data: session } = useSession();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastTypingAtRef = useRef(0);
  const typingTimeoutsRef = useRef({});

  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [oldestMessageAt, setOldestMessageAt] = useState(null);

  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [showEmbedComposer, setShowEmbedComposer] = useState(false);
  const [embed, setEmbed] = useState(emptyEmbed);
  const [sendingEmbed, setSendingEmbed] = useState(false);

  const canCreateEmbeds = ["owner", "admin", "moderator"].includes(
    currentMember?.role
  );

  useEffect(() => {
    if (!serverId || !channelId) return;

    setMessages([]);
    setTypingUsers([]);
    setHasMoreMessages(true);
    setOldestMessageAt(null);

    loadChannel();
    loadMessages(true);
    loadMembers();

    requestAnimationFrame(() => inputRef.current?.focus());
  }, [serverId, channelId]);

  useEffect(() => {
    if (!channelId) return;

    const pusherClient = getPusherClient();
    const pusherChannel = pusherClient.subscribe(`channel-${channelId}`);

    function handleNewMessage(message) {
      setMessages((prev) =>
        prev.some((item) => item._id === message._id) ? prev : [...prev, message]
      );

      removeTypingUser(message.authorId?._id || message.authorId);
    }

    function handleUpdatedMessage(updatedMessage) {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message
        )
      );
    }

    function handleDeletedMessage({ messageId }) {
      setMessages((prev) => prev.filter((message) => message._id !== messageId));
    }

    function handleTyping(user) {
      if (!user?.userId || user.userId === session?.user?.id) return;

      setTypingUsers((prev) => {
        const exists = prev.some((item) => item.userId === user.userId);
        return exists
          ? prev.map((item) => (item.userId === user.userId ? user : item))
          : [...prev, user];
      });

      clearTimeout(typingTimeoutsRef.current[user.userId]);
      typingTimeoutsRef.current[user.userId] = setTimeout(() => {
        removeTypingUser(user.userId);
      }, 3000);
    }

    pusherChannel.bind("message:new", handleNewMessage);
    pusherChannel.bind("message:update", handleUpdatedMessage);
    pusherChannel.bind("message:delete", handleDeletedMessage);
    pusherChannel.bind("user:typing", handleTyping);

    return () => {
      pusherChannel.unbind("message:new", handleNewMessage);
      pusherChannel.unbind("message:update", handleUpdatedMessage);
      pusherChannel.unbind("message:delete", handleDeletedMessage);
      pusherChannel.unbind("user:typing", handleTyping);
      pusherClient.unsubscribe(`channel-${channelId}`);

      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [channelId, session?.user?.id]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    async function handleScroll() {
      if (
        container.scrollTop > 150 ||
        !hasMoreMessages ||
        loadingMore ||
        loading
      ) {
        return;
      }

      const previousHeight = container.scrollHeight;
      await loadMessages(false);

      requestAnimationFrame(() => {
        container.scrollTop += container.scrollHeight - previousHeight;
      });
    }

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, loadingMore, loading, oldestMessageAt, channelId]);

  useEffect(() => {
    if (!loadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function focusInput() {
    if (
      editingMessage ||
      showEmbedComposer ||
      document.activeElement === inputRef.current
    ) {
      return;
    }

    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function removeTypingUser(userId) {
    if (!userId) return;

    clearTimeout(typingTimeoutsRef.current[userId]);
    delete typingTimeoutsRef.current[userId];

    setTypingUsers((prev) => prev.filter((item) => item.userId !== userId));
  }

  async function sendTypingEvent() {
    if (!channelId || editingMessage || showEmbedComposer) return;

    const now = Date.now();
    if (now - lastTypingAtRef.current < 1500) return;

    lastTypingAtRef.current = now;

    fetch("/api/messages/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId }),
    }).catch(() => {});
  }

  function getAuthorId(message) {
    const author = message?.authorId;
    return (author?._id || author || "").toString();
  }

  async function loadChannel() {
    const res = await fetch(`/api/channels/get-channels?serverId=${serverId}`);
    const data = await res.json();

    setChannel(data.channels?.find((item) => item._id === channelId) || null);
  }

  async function loadMembers() {
    const res = await fetch(`/api/servers/get-members?serverId=${serverId}`);
    const data = await res.json();

    if (res.ok) {
      setMembers(data.members || []);
      setCurrentMember(data.currentMember || null);
    }
  }

  async function loadMessages(initial = true) {
    try {
      initial ? setLoading(true) : setLoadingMore(true);

      let url = `/api/messages/get-messages?channelId=${channelId}`;
      if (!initial && oldestMessageAt) {
        url += `&before=${encodeURIComponent(oldestMessageAt)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) return;

      setMessages((prev) =>
        initial ? data.messages || [] : [...(data.messages || []), ...prev]
      );
      setHasMoreMessages(Boolean(data.hasMore));
      setOldestMessageAt(data.oldestMessageAt || null);
    } catch (error) {
      console.error("LOAD_MESSAGES_ERROR", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleContentChange(e) {
    const value = e.target.value;

    if (value.trim() === "/embed" && canCreateEmbeds) {
      setContent("");
      setShowEmbedComposer(true);
      return;
    }

    setContent(value);
    if (value.trim()) sendTypingEvent();

    const match = value.match(/(^|\s)@([a-zA-Z0-9_.-]*)$/);

    if (match) {
      setMentionQuery(match[2].toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  }

  const pingableMembers = members
    .filter((member) => member.userId?.username)
    .filter((member) =>
      member.userId.username.toLowerCase().includes(mentionQuery)
    )
    .slice(0, 8);

  function insertMention(member) {
    setContent((prev) =>
      prev.replace(/(^|\s)@([a-zA-Z0-9_.-]*)$/, `$1@${member.userId.username} `)
    );

    setShowMentions(false);
    setMentionQuery("");
    focusInput();
  }

  function startReply(message) {
    setReplyingTo(message);
    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!content.trim() || sending || showEmbedComposer) {
      focusInput();
      return;
    }

    const messageContent = content;
    const replyToId = replyingTo?._id || null;

    setSending(true);
    setContent("");
    setShowMentions(false);
    setReplyingTo(null);
    focusInput();

    try {
      const res = await fetch("/api/messages/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, content: messageContent, replyToId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setContent(messageContent);
        setReplyingTo(replyingTo);
        focusInput();
        return;
      }

      setMessages((prev) =>
        prev.some((item) => item._id === data.message._id)
          ? prev
          : [...prev, data.message]
      );
    } catch (error) {
      console.error("SEND_MESSAGE_ERROR", error);
      setContent(messageContent);
      setReplyingTo(replyingTo);
    } finally {
      setSending(false);
      focusInput();
    }
  }

  async function sendEmbed() {
    if (sendingEmbed || (!embed.title.trim() && !embed.description.trim())) {
      return;
    }

    try {
      setSendingEmbed(true);

      const res = await fetch("/api/messages/send-embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, ...embed }),
      });

      const data = await res.json();

      if (!res.ok) return;

      setMessages((prev) =>
        prev.some((item) => item._id === data.message._id)
          ? prev
          : [...prev, data.message]
      );

      setEmbed(emptyEmbed);
      setShowEmbedComposer(false);
      focusInput();
    } catch (error) {
      console.error("SEND_EMBED_ERROR", error);
    } finally {
      setSendingEmbed(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingMessage || !editContent.trim()) return;

    const res = await fetch("/api/messages/update", {
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

    const res = await fetch("/api/messages/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: message._id }),
    });

    if (!res.ok) return;

    setMessages((prev) => prev.filter((item) => item._id !== message._id));

    if (replyingTo?._id === message._id) {
      setReplyingTo(null);
    }

    focusInput();
  }

  function cancelEdit() {
    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  function formatTime(date) {
    return new Date(date).toLocaleString([], {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  function renderMessageContent(text = "") {
    const username = session?.user?.username;
    const parts = text.split(/(@[a-zA-Z0-9_.-]+)/g);

    return parts.map((part, index) => {
      if (!part.startsWith("@")) return part;

      const cleanMention = part.slice(1).toLowerCase();
      const isMe = username && cleanMention === username.toLowerCase();

      return (
        <span
          key={index}
          className={`rounded px-1 font-semibold ${
            isMe
              ? "bg-yellow-400/20 text-yellow-200"
              : "bg-violet-500/20 text-violet-200"
          }`}
        >
          {part}
        </span>
      );
    });
  }

  function ReplyPreview({ reply }) {
    if (!reply) return null;

    return (
      <div className="mb-1 flex max-w-full items-center gap-2 text-xs text-slate-500">
        <span className="text-slate-600">↳</span>
        <span className="shrink-0 font-semibold text-slate-400">
          {reply.authorId?.username || "Unknown User"}
        </span>
        <span className="truncate text-slate-500">
          {reply.content || "Original message unavailable"}
        </span>
      </div>
    );
  }

  function EmbedCard({ embed }) {
    if (!embed) return null;

    const color = /^#[0-9A-Fa-f]{6}$/.test(embed.color || "")
      ? embed.color
      : "#7c3aed";

    return (
      <div
        className="mt-2 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-white/[0.035]"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="p-4">
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              {embed.title &&
                (embed.url ? (
                  <a
                    href={embed.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words text-sm font-black text-blue-300 hover:underline"
                  >
                    {embed.title}
                  </a>
                ) : (
                  <p className="break-words text-sm font-black text-white">
                    {embed.title}
                  </p>
                ))}

              {embed.description && (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-slate-300">
                  {embed.description}
                </p>
              )}
            </div>

            {embed.thumbnail && (
              <img
                src={embed.thumbnail}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            )}
          </div>

          {embed.image && (
            <img
              src={embed.image}
              alt=""
              className="mt-4 max-h-72 w-full rounded-xl object-cover"
            />
          )}

          {embed.footer && (
            <p className="mt-4 truncate text-xs text-slate-500">
              {embed.footer}
            </p>
          )}
        </div>
      </div>
    );
  }

  function TypingIndicator() {
    if (typingUsers.length === 0) return null;

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

  function EmbedComposer() {
    if (!showEmbedComposer) return null;

    return (
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">Create Embed</p>
            <p className="text-xs text-slate-500">
              Build an embed directly in chat.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowEmbedComposer(false);
              setEmbed(emptyEmbed);
              focusInput();
            }}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <input
              value={embed.content}
              onChange={(e) => setEmbed({ ...embed, content: e.target.value })}
              placeholder="Optional message above embed"
              maxLength={2000}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <input
              value={embed.title}
              onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
              placeholder="Embed title"
              maxLength={256}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <textarea
              value={embed.description}
              onChange={(e) =>
                setEmbed({ ...embed, description: e.target.value })
              }
              placeholder="Embed description"
              maxLength={4096}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
              <input
                type="color"
                value={embed.color}
                onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 p-1"
              />

              <input
                value={embed.footer}
                onChange={(e) => setEmbed({ ...embed, footer: e.target.value })}
                placeholder="Footer"
                maxLength={2048}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
              />
            </div>

            <input
              value={embed.thumbnail}
              onChange={(e) =>
                setEmbed({ ...embed, thumbnail: e.target.value })
              }
              placeholder="Thumbnail URL"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <input
              value={embed.image}
              onChange={(e) => setEmbed({ ...embed, image: e.target.value })}
              placeholder="Image URL"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <button
              type="button"
              onClick={sendEmbed}
              disabled={
                sendingEmbed || (!embed.title.trim() && !embed.description.trim())
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-black text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              <Send size={16} />
              {sendingEmbed ? "Sending..." : "Send Embed"}
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Preview
            </p>

            <EmbedCard embed={embed} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#080b18]">
      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20">
            <span className="text-4xl">#</span>
          </div>

          <h2 className="text-3xl font-black">
            Welcome to #{channel?.name || "channel"}!
          </h2>

          <p className="mt-2 text-slate-400">
            This is the start of the #{channel?.name || "channel"} channel.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <div className="space-y-0">
            {loadingMore && (
              <p className="py-3 text-center text-xs text-slate-500">
                Loading older messages...
              </p>
            )}

            {!hasMoreMessages && messages.length > 0 && (
              <p className="py-3 text-center text-xs text-slate-600">
                Beginning of channel
              </p>
            )}

            {messages.map((message, index) => {
              const author = message.authorId;
              const isEditing = editingMessage?._id === message._id;
              const previousMessage = messages[index - 1];

              const grouped =
                previousMessage &&
                !previousMessage.system &&
                !message.system &&
                !message.replyToId &&
                getAuthorId(previousMessage) === getAuthorId(message);

              const isAuthor = getAuthorId(message) === session?.user?.id;
              const canModerateMessages = [
                "owner",
                "admin",
                "moderator",
              ].includes(currentMember?.role);

              if (message.system) {
                return (
                  <div
                    key={message._id}
                    className="flex items-center gap-3 py-3"
                  >
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
                  key={message._id}
                  className={`group relative flex gap-4 rounded-lg px-2 transition ${
                    grouped ? "py-[1px]" : "py-2"
                  } ${isEditing ? "bg-white/[0.05]" : "hover:bg-white/[0.04]"}`}
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
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setEditingMessage(message);
                            setEditContent(message.content);
                            setReplyingTo(null);
                          }}
                          className="p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {(isAuthor || canModerateMessages) && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleDeleteMessage(message)}
                          className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
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
                    <Image
                      src={author?.avatar || "/logo.png"}
                      alt={author?.username || "User"}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    {message.replyToId && (
                      <ReplyPreview reply={message.replyToId} />
                    )}

                    {!grouped && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-violet-300">
                          {author?.username || "Unknown User"}
                        </span>

                        {author?.isStaff && (
                          <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-black">
                            STAFF
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
                          <p className="whitespace-pre-wrap break-words text-slate-100 leading-[1.375rem]">
                            {renderMessageContent(message.content)}

                            {message.edited && grouped && (
                              <span className="ml-2 text-xs text-slate-500">
                                edited
                              </span>
                            )}
                          </p>
                        )}

                        {message.embeds?.length > 0 && (
                          <div className="space-y-2">
                            {message.embeds.map((embed, embedIndex) => (
                              <EmbedCard
                                key={`${message._id}-embed-${embedIndex}`}
                                embed={embed}
                              />
                            ))}
                          </div>
                        )}
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
        {showMentions && pingableMembers.length > 0 && (
          <div className="absolute bottom-[86px] left-4 right-4 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
            {pingableMembers.map((member) => {
              const user = member.userId;

              return (
                <button
                  key={member._id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertMention(member)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/[0.06]"
                >
                  <Image
                    src={user?.avatar || "/logo.png"}
                    alt={user?.username || "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {user?.username}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      @{user?.username}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {replyingTo && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">
                Replying to{" "}
                <span className="font-semibold text-violet-300">
                  {replyingTo.authorId?.username || "Unknown User"}
                </span>
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

        <TypingIndicator />
        <EmbedComposer />

        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) focusInput();
          }}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 hover:bg-violet-600 hover:text-white"
          >
            <Plus size={18} />
          </button>

          <input
            ref={inputRef}
            value={content}
            onChange={handleContentChange}
            disabled={!!editingMessage || showEmbedComposer}
            placeholder={
              showEmbedComposer
                ? "Finish or close embed composer"
                : `Message #${channel?.name || "channel"}`
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
          />

          <div className="flex shrink-0 items-center gap-3 text-slate-400">
            <Gift
              size={19}
              className="cursor-pointer transition hover:text-white"
            />

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

            <Smile
              size={19}
              className="cursor-pointer transition hover:text-white"
            />
          </div>
        </div>
      </form>
    </section>
  );
}
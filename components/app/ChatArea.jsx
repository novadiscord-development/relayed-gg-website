import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Plus,
  Gift,
  Smile,
  Sticker,
  Pencil,
  Trash2,
  Reply,
  X,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

export default function ChatArea() {
  const router = useRouter();
  const { serverId, channelId } = router.query;
  const { data: session } = useSession();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const notificationAudioRef = useRef(null);
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
      setMessages((prev) => {
        const exists = prev.some((item) => item._id === message._id);
        if (exists) return prev;

        if (shouldPlayPing(message)) {
          notificationAudioRef.current?.play().catch(() => {});
        }

        return [...prev, message];
      });

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
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId)
      );
    }

    function handleTyping(user) {
      if (!user?.userId) return;
      if (user.userId === session?.user?.id) return;

      setTypingUsers((prev) => {
        const exists = prev.some((item) => item.userId === user.userId);

        if (exists) {
          return prev.map((item) =>
            item.userId === user.userId ? user : item
          );
        }

        return [...prev, user];
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
  }, [channelId, session?.user?.username, session?.user?.id]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    async function handleScroll() {
      if (container.scrollTop > 150) return;
      if (!hasMoreMessages || loadingMore || loading) return;

      const previousHeight = container.scrollHeight;

      await loadMessages(false);

      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop += newHeight - previousHeight;
      });
    }

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMoreMessages, loadingMore, loading, oldestMessageAt, channelId]);

  useEffect(() => {
    if (!loadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function focusInput() {
    if (!editingMessage) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function removeTypingUser(userId) {
    if (!userId) return;

    clearTimeout(typingTimeoutsRef.current[userId]);
    delete typingTimeoutsRef.current[userId];

    setTypingUsers((prev) => prev.filter((item) => item.userId !== userId));
  }

  async function sendTypingEvent() {
    if (!channelId || editingMessage) return;

    const now = Date.now();

    if (now - lastTypingAtRef.current < 1500) return;

    lastTypingAtRef.current = now;

    fetch("/api/messages/typing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    const currentChannel = data.channels?.find(
      (item) => item._id === channelId
    );

    setChannel(currentChannel || null);
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
      if (initial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let url = `/api/messages/get-messages?channelId=${channelId}`;

      if (!initial && oldestMessageAt) {
        url += `&before=${encodeURIComponent(oldestMessageAt)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) return;

      if (initial) {
        setMessages(data.messages || []);
      } else {
        setMessages((prev) => [...(data.messages || []), ...prev]);
      }

      setHasMoreMessages(Boolean(data.hasMore));
      setOldestMessageAt(data.oldestMessageAt || null);
    } catch (error) {
      console.error("LOAD_MESSAGES_ERROR", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function shouldPlayPing(message) {
    if (!message?.content || message.system) return false;

    if (getAuthorId(message) === session?.user?.id) return false;

    const username = session?.user?.username;
    if (!username) return false;

    const mentionRegex = new RegExp(
      `(^|\\s)@${escapeRegExp(username)}(?=\\s|$|[.,!?])`,
      "i"
    );

    return mentionRegex.test(message.content);
  }

  function handleContentChange(e) {
    const value = e.target.value;
    setContent(value);

    if (value.trim()) {
      sendTypingEvent();
    }

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
    const username = member.userId.username;

    setContent((prev) =>
      prev.replace(/(^|\s)@([a-zA-Z0-9_.-]*)$/, `$1@${username} `)
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

    if (!content.trim() || sending) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          content: messageContent,
          replyToId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setContent(messageContent);
        setReplyingTo(replyingTo);
        focusInput();
        return;
      }

      setMessages((prev) => {
        const exists = prev.some((item) => item._id === data.message._id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    } catch (error) {
      console.error("SEND_MESSAGE_ERROR", error);
      setContent(messageContent);
      setReplyingTo(replyingTo);
    } finally {
      setSending(false);
      focusInput();
    }
  }

  async function handleSaveEdit() {
    if (!editingMessage || !editContent.trim()) return;

    const res = await fetch("/api/messages/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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
    const confirmed = confirm("Delete this message?");

    if (!confirmed) {
      focusInput();
      return;
    }

    const res = await fetch("/api/messages/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId: message._id,
      }),
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

  function renderMessageContent(text) {
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

  function TypingIndicator() {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((user) => user.username);

  let text = "";

  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = "Several people are typing";
  }

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

  return (
    <section
      onMouseDown={focusInput}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#080b18]"
    >
      <audio ref={notificationAudioRef} src="/sounds/ping.mp3" preload="auto" />

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

              const canEditMessage = isAuthor;
              const canDeleteMessage = isAuthor || canModerateMessages;

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

                      {canEditMessage && (
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

                      {canDeleteMessage && (
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
                          <span className="text-xs text-slate-500">
                            edited
                          </span>
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
                      <p className="whitespace-pre-wrap break-words text-slate-100 leading-[1.375rem]">
                        {renderMessageContent(message.content)}

                        {message.edited && grouped && (
                          <span className="ml-2 text-xs text-slate-500">
                            edited
                          </span>
                        )}
                      </p>
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

        <div
          onMouseDown={() => focusInput()}
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
            disabled={!!editingMessage}
            placeholder={`Message #${channel?.name || "channel"}`}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
          />

          <div className="flex shrink-0 items-center gap-3 text-slate-400">
            <Gift size={19} className="hover:text-white" />
            <Sticker size={19} className="hover:text-white" />
            <Smile size={19} className="hover:text-white" />
          </div>
        </div>
      </form>
    </section>
  );
}
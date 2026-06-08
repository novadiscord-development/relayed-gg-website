import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Plus, Gift, Smile, Reply, X } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import UserProfilePopout from "@/components/users/UserProfilePopout";

export default function DMChatArea() {
  const router = useRouter();
  const { conversationId } = router.query;
  const { data: session } = useSession();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    setMessages([]);
    setReplyingTo(null);
    setSelectedUser(null);

    loadConversation();
    loadMessages();

    requestAnimationFrame(() => inputRef.current?.focus());
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const pusherClient = getPusherClient();
    const pusherChannel = pusherClient.subscribe(`dm-${conversationId}`);

    function handleNewMessage(message) {
      setMessages((prev) =>
        prev.some((item) => item._id === message._id)
          ? prev
          : [...prev, message]
      );
    }

    pusherChannel.bind("dm:message:new", handleNewMessage);

    return () => {
      pusherChannel.unbind("dm:message:new", handleNewMessage);
      pusherClient.unsubscribe(`dm-${conversationId}`);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getAuthorId(message) {
    const author = message?.authorId;
    return (author?._id || author || "").toString();
  }

  function getOtherUser() {
    return conversation?.participants?.find(
      (user) => user._id !== session?.user?.id
    );
  }

  function focusInput() {
    if (selectedUser || document.activeElement === inputRef.current) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function loadConversation() {
    try {
      const res = await fetch("/api/dms/get-conversations");
      const data = await res.json();

      if (!res.ok) return;

      const current = (data.conversations || []).find(
        (item) => item._id === conversationId
      );

      setConversation(current || null);
    } catch (error) {
      console.error("LOAD_DM_CONVERSATION_ERROR", error);
    }
  }

  async function loadMessages() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/dms/get-messages?conversationId=${conversationId}`
      );
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("LOAD_DM_MESSAGES_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  function startReply(message) {
    setReplyingTo(message);
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
    setReplyingTo(null);
    focusInput();

    try {
      const res = await fetch("/api/dms/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
          replyToId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setContent(messageContent);
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

  const otherUser = getOtherUser();

  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#080b18]">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[#080b18] px-6">
          <Image
            src={otherUser?.avatar || otherUser?.image || "/logo.png"}
            alt={otherUser?.username || "User"}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />

          <div className="min-w-0">
            <h1 className="truncate text-sm font-black text-white">
              {otherUser?.username || otherUser?.name || "Direct Message"}
            </h1>
            <p className="text-xs text-slate-500">Private conversation</p>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <Image
              src={otherUser?.avatar || otherUser?.image || "/logo.png"}
              alt={otherUser?.username || "User"}
              width={72}
              height={72}
              className="mb-4 h-18 w-18 rounded-full object-cover"
            />

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
            <p className="text-sm text-slate-500">
              No messages yet. Say hello.
            </p>
          ) : (
            <div className="space-y-0">
              {messages.map((message, index) => {
                const author = message.authorId;
                const previousMessage = messages[index - 1];

                const grouped =
                  previousMessage &&
                  !message.replyToId &&
                  getAuthorId(previousMessage) === getAuthorId(message);

                return (
                  <div
                    key={message._id}
                    className={`group relative flex gap-4 rounded-lg px-2 transition hover:bg-white/[0.04] ${
                      grouped ? "py-[1px]" : "py-2"
                    }`}
                  >
                    <div className="absolute right-4 top-0 hidden -translate-y-1/2 overflow-hidden rounded-lg border border-white/10 bg-[#111827] shadow-xl group-hover:flex">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => startReply(message)}
                        className="p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                      >
                        <Reply size={16} />
                      </button>
                    </div>

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
                      {message.replyToId && (
                        <ReplyPreview reply={message.replyToId} />
                      )}

                      {!grouped && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(author)}
                            className="font-bold text-violet-300 hover:underline"
                          >
                            {author?.username || "Unknown User"}
                          </button>

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
                        </div>
                      )}

                      {message.content && (
                        <p className="whitespace-pre-wrap break-words leading-[1.375rem] text-slate-100">
                          {message.content}
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
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Message ${otherUser?.username || ""}`}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />

            <div className="flex shrink-0 items-center gap-3 text-slate-400">
              <Gift
                size={19}
                className="cursor-pointer transition hover:text-white"
              />

              <Smile
                size={19}
                className="cursor-pointer transition hover:text-white"
              />
            </div>
          </div>
        </form>
      </section>

      {selectedUser && (
        <UserProfilePopout
          user={selectedUser}
          member={null}
          presence={{ status: "offline", customStatus: "" }}
          onClose={() => {
            setSelectedUser(null);
            focusInput();
          }}
        />
      )}
    </>
  );
}
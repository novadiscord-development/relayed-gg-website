import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  Plus,
  Gift,
  Smile,
  Sticker,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

export default function ChatArea() {
  const router = useRouter();
  const { serverId, channelId } = router.query;

  const bottomRef = useRef(null);

  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!serverId || !channelId) return;

    loadChannel();
    loadMessages();
  }, [serverId, channelId]);

  useEffect(() => {
    if (!channelId) return;

    const pusherClient = getPusherClient();
    const pusherChannel = pusherClient.subscribe(`channel-${channelId}`);

    function handleNewMessage(message) {
      setMessages((prev) => {
        const exists = prev.some((item) => item._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
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

    pusherChannel.bind("message:new", handleNewMessage);
    pusherChannel.bind("message:update", handleUpdatedMessage);
    pusherChannel.bind("message:delete", handleDeletedMessage);

    return () => {
      pusherChannel.unbind("message:new", handleNewMessage);
      pusherChannel.unbind("message:update", handleUpdatedMessage);
      pusherChannel.unbind("message:delete", handleDeletedMessage);
      pusherClient.unsubscribe(`channel-${channelId}`);
    };
  }, [channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadChannel() {
    const res = await fetch(`/api/channels/get-channels?serverId=${serverId}`);
    const data = await res.json();

    const currentChannel = data.channels?.find(
      (item) => item._id === channelId
    );

    setChannel(currentChannel || null);
  }

  async function loadMessages() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/messages/get-messages?channelId=${channelId}`
      );

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("LOAD_MESSAGES_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!content.trim() || sending) return;

    const messageContent = content;

    try {
      setSending(true);
      setContent("");

      const res = await fetch("/api/messages/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          content: messageContent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setContent(messageContent);
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
    } finally {
      setSending(false);
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
  }

  async function handleDeleteMessage(message) {
    const confirmed = confirm("Delete this message?");
    if (!confirmed) return;

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
  }

  function formatTime(date) {
    return new Date(date).toLocaleString([], {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#080b18]">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
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
            <div className="space-y-2">
              {messages.map((message) => {
                const author = message.authorId;

                return (
                  <div
                    key={message._id}
                    className="group relative flex gap-4 rounded-lg px-2 py-2 transition hover:bg-white/[0.04]"
                  >
                    <div className="absolute right-4 top-0 hidden -translate-y-1/2 overflow-hidden rounded-lg border border-white/10 bg-[#111827] shadow-xl group-hover:flex">
                      <button
                        onClick={() => {
                          setEditingMessage(message);
                          setEditContent(message.content);
                        }}
                        title="Edit Message"
                        className="p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteMessage(message)}
                        title="Delete Message"
                        className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <Image
                      src={author?.avatar || "/logo.png"}
                      alt={author?.username || "User"}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full"
                    />

                    <div className="min-w-0 flex-1">
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

                        {message.edited && (
                          <span className="text-xs text-slate-500">
                            edited
                          </span>
                        )}
                      </div>

                      <p className="mt-1 whitespace-pre-wrap break-words text-slate-100">
                        {message.content}
                      </p>
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
          className="shrink-0 border-t border-white/10 bg-[#080b18] p-4"
        >
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 hover:bg-violet-600 hover:text-white"
            >
              <Plus size={18} />
            </button>

            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={sending}
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

      {editingMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f1d] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Edit Message</h2>

              <button
                onClick={() => setEditingMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingMessage(null)}
                className="flex-1 rounded-xl border border-white/10 py-3 font-bold text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="flex-1 rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
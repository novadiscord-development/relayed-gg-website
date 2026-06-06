import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Plus, Gift, Smile, Sticker } from "lucide-react";

export default function ChatArea() {
  const router = useRouter();
  const { serverId, channelId } = router.query;

  const bottomRef = useRef(null);

  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!serverId || !channelId) return;

    loadChannel();
    loadMessages();
  }, [serverId, channelId]);

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

      const res = await fetch(`/api/messages/get-messages?channelId=${channelId}`);
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

    try {
      setSending(true);

      const res = await fetch("/api/messages/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) return;

      setMessages((prev) => [...prev, data.message]);
      setContent("");
    } catch (error) {
      console.error("SEND_MESSAGE_ERROR", error);
    } finally {
      setSending(false);
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

  return (
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
          <div className="space-y-6">
            {messages.map((message) => {
              const author = message.authorId;

              return (
                <div key={message._id} className="group flex gap-4">
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
  );
}
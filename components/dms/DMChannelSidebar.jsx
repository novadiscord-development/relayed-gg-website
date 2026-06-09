import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Search,
  Users,
  MessageCircle,
  Plus,
  UserPlus,
  Inbox,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

export default function DMChannelSidebar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const activeConversationId = router.query.conversationId;

  useEffect(() => {
    if (!session?.user?.id) return;

    loadConversations();

    const handleFocus = () => loadConversations();
    window.addEventListener("focus", handleFocus);

    const pusherClient = getPusherClient();
    const channelName = `user-${session.user.id}`;
    const userChannel = pusherClient.subscribe(channelName);

    function handleConversationUpdate({ conversationId, message, unread }) {
      setConversations((prev) => {
        const existing = prev.find((item) => sameId(item._id, conversationId));

        if (!existing) {
          loadConversations();
          return prev;
        }

        const isActive = sameId(activeConversationId, conversationId);

        const updated = {
          ...existing,
          lastMessageId: message,
          lastMessageAt: message.createdAt,
          updatedAt: message.createdAt,
          notification: {
            ...(existing.notification || {}),
            unread: isActive ? false : Boolean(unread),
            lastMessageAt: message.createdAt,
          },
        };

        return [updated, ...prev.filter((item) => !sameId(item._id, conversationId))];
      });
    }

    userChannel.bind("dm:conversation:update", handleConversationUpdate);

    return () => {
      window.removeEventListener("focus", handleFocus);
      userChannel.unbind("dm:conversation:update", handleConversationUpdate);
      pusherClient.unsubscribe(channelName);
    };
  }, [session?.user?.id, activeConversationId]);

  useEffect(() => {
    if (!session?.user?.id) return;

    loadConversations(false);

    if (activeConversationId) {
      markConversationRead(activeConversationId);
    }
  }, [activeConversationId, session?.user?.id]);

  async function loadConversations(showLoading = true) {
    try {
      if (showLoading) setLoading(true);

      const res = await fetch("/api/dms/get-conversations", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("LOAD_DM_CONVERSATIONS_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  async function markConversationRead(conversationId) {
    setConversations((prev) =>
      prev.map((conversation) =>
        sameId(conversation._id, conversationId)
          ? {
              ...conversation,
              notification: {
                ...(conversation.notification || {}),
                unread: false,
                mentions: 0,
              },
            }
          : conversation
      )
    );

    fetch("/api/dms/mark-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {});
  }

  function sameId(a, b) {
    return (a || "").toString() === (b || "").toString();
  }

  function getOtherUser(conversation) {
    return conversation.participants?.find(
      (user) => !sameId(user._id, session?.user?.id)
    );
  }

  function getLastMessageText(conversation) {
    const message = conversation.lastMessageId;

    if (!message) return "No messages yet";
    if (message.deleted) return "Message deleted";

    const authorName = sameId(message.authorId?._id, session?.user?.id)
      ? "You"
      : message.authorId?.username || "User";

    return `${authorName}: ${message.content || "Sent a message"}`;
  }

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const otherUser = getOtherUser(conversation);
      const name = otherUser?.username || otherUser?.name || "";

      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [conversations, search, session?.user?.id]);

  return (
    <aside className="hidden h-screen w-[300px] shrink-0 flex-col border-r border-white/10 bg-[#0b0f1d] md:flex">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <Search size={16} className="text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find or start a conversation"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="shrink-0 space-y-1 p-3">
        <button
          type="button"
          onClick={() => router.push("/app/me")}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
            !activeConversationId
              ? "bg-white/[0.08] text-white"
              : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
          }`}
        >
          <Users size={18} />
          Friends
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <Inbox size={18} />
          Requests
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <UserPlus size={18} />
          Add Friend
        </button>
      </div>

      <div className="mx-4 h-px bg-white/10" />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">
            Direct Messages
          </h3>

          <button
            type="button"
            title="Start DM"
            className="rounded-md p-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {loading ? (
            <p className="px-3 py-2 text-sm text-slate-500">
              Loading conversations...
            </p>
          ) : filteredConversations.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
                <MessageCircle size={22} />
              </div>

              <p className="text-sm font-bold text-slate-400">No DMs yet</p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Start a conversation from a user profile.
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const isActive = sameId(activeConversationId, conversation._id);
              const unread = conversation.notification?.unread && !isActive;

              return (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => router.push(`/app/me/${conversation._id}`)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : unread
                      ? "text-white hover:bg-white/[0.06]"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Image
                      src={otherUser?.avatar || otherUser?.image || "/logo.png"}
                      alt={otherUser?.username || otherUser?.name || "User"}
                      width={38}
                      height={38}
                      className="h-[38px] w-[38px] rounded-full object-cover"
                    />

                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0b0f1d] bg-slate-600" />

                    {unread && (
                      <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-bold ${
                        isActive || unread ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {otherUser?.username || otherUser?.name || "Unknown User"}
                    </p>

                    <p
                      className={`truncate text-xs ${
                        unread ? "font-semibold text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {getLastMessageText(conversation)}
                    </p>
                  </div>

                  {unread && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,0.7)]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
      <UserPanel />
    </aside>
  );
}
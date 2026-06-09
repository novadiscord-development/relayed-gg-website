import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Hash, Bell, Pin, Users, Search } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

export default function ChatHeader() {
  const router = useRouter();
  const { serverId, channelId } = router.query;
  const { data: session } = useSession();

  const [channel, setChannel] = useState(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!serverId || !channelId) return;
    loadChannel();
  }, [serverId, channelId]);

  useEffect(() => {
    if (!session?.user?.id) return;

    loadNotifications();

    const pusherClient = getPusherClient();
    const userChannel = pusherClient.subscribe(`user-${session.user.id}`);

    function handleNewNotification({ notification }) {
      if (!notification) return;

      setNotifications((prev) => [notification, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    }

    userChannel.bind("notification:new", handleNewNotification);

    return () => {
      userChannel.unbind("notification:new", handleNewNotification);
      pusherClient.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!channelId) return;

    const timeout = setTimeout(async () => {
      const query = search.trim();

      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        setSearching(true);

        const res = await fetch(
          `/api/messages/search?channelId=${channelId}&q=${encodeURIComponent(
            query
          )}`
        );

        const data = await res.json();

        if (res.ok) {
          setResults(data.messages || []);
        }
      } catch (error) {
        console.error("SEARCH_MESSAGES_ERROR", error);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, channelId]);

  async function loadChannel() {
    const res = await fetch(`/api/channels/get-channels?serverId=${serverId}`);
    const data = await res.json();

    const currentChannel = data.channels?.find(
      (item) => item._id === channelId
    );

    setChannel(currentChannel || null);
  }

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications/get");
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("LOAD_NOTIFICATIONS_ERROR", error);
    }
  }

  async function markAllNotificationsRead() {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      });

      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            read: true,
          }))
        );
      }
    } catch (error) {
      console.error("MARK_NOTIFICATIONS_READ_ERROR", error);
    }
  }

  function jumpToMessage(message) {
    window.dispatchEvent(
      new CustomEvent("chat:jump-to-message", {
        detail: {
          message,
          messageId: message._id,
          createdAt: message.createdAt,
        },
      })
    );

    setSearch("");
    setResults([]);
  }

  function formatNotificationTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#080b18]/80 px-5 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <Hash size={24} className="text-slate-400" />

        <h1 className="truncate font-black">{channel?.name || "loading"}</h1>

        <div className="hidden h-6 w-px bg-white/10 md:block" />

        <p className="hidden truncate text-sm text-slate-400 md:block">
          This is the start of #{channel?.name || "this channel"}.
        </p>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative transition hover:text-white"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-8 z-50 w-96 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <h2 className="text-sm font-black text-white">
                    Notifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-xs font-bold text-violet-300 hover:text-violet-200"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`flex gap-3 border-b border-white/5 p-4 last:border-b-0 ${
                        notification.read
                          ? "bg-transparent"
                          : "bg-violet-500/5"
                      }`}
                    >
                      <Image
                        src={
                          notification.actorId?.avatar ||
                          notification.actorId?.image ||
                          "/logo.png"
                        }
                        alt={notification.actorId?.username || "Notification"}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-sm font-bold text-white">
                            {notification.title || "Notification"}
                          </p>

                          {!notification.read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[11px] text-slate-600">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Pin size={20} className="hover:text-white" />
        <Users size={20} className="hover:text-white" />

        <div className="relative hidden items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 lg:flex">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />

          <Search size={16} />

          {(results.length > 0 || searching || search.trim().length >= 2) && (
            <div className="absolute right-0 top-[42px] z-50 w-[430px] overflow-hidden rounded-xl border border-white/10 bg-[#111827] shadow-2xl">
              {searching ? (
                <p className="p-4 text-sm text-slate-500">Searching...</p>
              ) : results.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No messages found.</p>
              ) : (
                results.map((message) => (
                  <button
                    key={message._id}
                    type="button"
                    onClick={() => jumpToMessage(message)}
                    className="block w-full border-b border-white/5 p-3 text-left transition last:border-b-0 hover:bg-white/[0.05]"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold text-white">
                        {message.authorId?.username || "Unknown User"}
                      </p>

                      <span className="shrink-0 text-[11px] text-slate-600">
                        {new Date(message.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-xs leading-5 text-slate-400">
                      {message.content}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
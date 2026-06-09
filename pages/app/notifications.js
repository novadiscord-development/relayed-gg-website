import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import ServerBar from "@/components/app/ServerBar";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);

      const res = await fetch("/api/notifications/get");
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("LOAD_NOTIFICATIONS_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    const res = await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ all: true }),
    });

    if (!res.ok) return;

    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function openNotification(notification) {
    if (notification.conversationId) {
      router.push(`/app/me/${notification.conversationId}`);
      return;
    }

    if (notification.serverId && notification.channelId) {
      router.push(`/app/servers/${notification.serverId}/${notification.channelId}`);
      return;
    }

    if (notification.actorId?._id) {
      router.push(`/app/user/${notification.actorId._id}`);
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
      <ServerBar />

      <section className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-3 text-4xl font-black">
                <Bell className="text-violet-400" />
                Notifications
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <CheckCheck size={17} />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1d]/90 shadow-2xl">
            {loading ? (
              <p className="p-6 text-sm text-slate-500">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                You have no notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex w-full gap-4 border-b border-white/5 p-5 text-left transition last:border-b-0 hover:bg-white/[0.04] ${
                    notification.read ? "bg-transparent" : "bg-violet-500/5"
                  }`}
                >
                  <Image
                    src={
                      notification.actorId?.avatar ||
                      notification.actorId?.image ||
                      "/logo.png"
                    }
                    alt={notification.actorId?.username || "Notification"}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="truncate text-sm font-black text-white">
                        {notification.title || "Notification"}
                      </h2>

                      {!notification.read && (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-400" />
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
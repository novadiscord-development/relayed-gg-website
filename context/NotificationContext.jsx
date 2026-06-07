import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setNotifications({});
      setLoaded(false);
      return;
    }

    loadNotifications();
  }, [session?.user?.id]);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (!res.ok) return;

      const nextNotifications = {};

      (data.notifications || []).forEach((notification) => {
        const serverId = notification.serverId?.toString();
        const channelId = notification.channelId?.toString();

        if (!serverId || !channelId) return;

        if (!nextNotifications[serverId]) {
          nextNotifications[serverId] = {};
        }

        nextNotifications[serverId][channelId] = {
          unread: Boolean(notification.unread),
          mentions: notification.mentions || 0,
          lastMessageAt: notification.lastMessageAt || null,
        };
      });

      setNotifications(nextNotifications);
      setLoaded(true);
    } catch (error) {
      console.error("LOAD_NOTIFICATIONS_ERROR", error);
    }
  }

  function addUnread(serverId, channelId) {
    if (!serverId || !channelId) return;

    setNotifications((prev) => ({
      ...prev,
      [serverId]: {
        ...(prev[serverId] || {}),
        [channelId]: {
          ...(prev[serverId]?.[channelId] || {}),
          unread: true,
          mentions: prev[serverId]?.[channelId]?.mentions || 0,
          lastMessageAt: new Date().toISOString(),
        },
      },
    }));
  }

  function addMention(serverId, channelId) {
    if (!serverId || !channelId) return;

    setNotifications((prev) => ({
      ...prev,
      [serverId]: {
        ...(prev[serverId] || {}),
        [channelId]: {
          ...(prev[serverId]?.[channelId] || {}),
          unread: true,
          mentions: (prev[serverId]?.[channelId]?.mentions || 0) + 1,
          lastMessageAt: new Date().toISOString(),
        },
      },
    }));
  }

  async function clearChannel(serverId, channelId) {
    if (!serverId || !channelId) return;

    setNotifications((prev) => {
      const copy = { ...prev };
      const serverNotifications = { ...(copy[serverId] || {}) };

      delete serverNotifications[channelId];

      if (Object.keys(serverNotifications).length === 0) {
        delete copy[serverId];
      } else {
        copy[serverId] = serverNotifications;
      }

      return copy;
    });

    fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId,
        channelId,
      }),
    }).catch(() => {});
  }

  async function clearServer(serverId) {
    if (!serverId) return;

    setNotifications((prev) => {
      const copy = { ...prev };
      delete copy[serverId];
      return copy;
    });

    fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId,
      }),
    }).catch(() => {});
  }

  function getChannelNotification(serverId, channelId) {
    return (
      notifications?.[serverId]?.[channelId] || {
        unread: false,
        mentions: 0,
      }
    );
  }

  function getServerNotification(serverId) {
    const channels = notifications?.[serverId] || {};
    const values = Object.values(channels);

    return {
      unread: values.some((item) => item.unread),
      mentions: values.reduce(
        (total, item) => total + (item.mentions || 0),
        0
      ),
    };
  }

  const value = useMemo(
    () => ({
      notifications,
      loaded,
      loadNotifications,
      addUnread,
      addMention,
      clearChannel,
      clearServer,
      getChannelNotification,
      getServerNotification,
    }),
    [notifications, loaded]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
}
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { data: session } = useSession();

  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const previousMentionTotalRef = useRef(0);

  const [notifications, setNotifications] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setNotifications({});
      setLoaded(false);
      previousMentionTotalRef.current = 0;
      return;
    }

    loadNotifications();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [session?.user?.id, loaded]);

  useEffect(() => {
    function unlockAudio() {
      if (audioUnlockedRef.current) return;

      const audio = audioRef.current;
      if (!audio) return;

      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audioUnlockedRef.current = true;
        })
        .catch(() => {});
    }

    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

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

      const nextMentionTotal = Object.values(nextNotifications).reduce(
        (serverTotal, channels) =>
          serverTotal +
          Object.values(channels).reduce(
            (channelTotal, item) => channelTotal + (item.mentions || 0),
            0
          ),
        0
      );

      if (
        loaded &&
        nextMentionTotal > previousMentionTotalRef.current &&
        audioUnlockedRef.current
      ) {
        audioRef.current.currentTime = 0;
        audioRef.current?.play().catch(() => {});
      }

      previousMentionTotalRef.current = nextMentionTotal;

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

    if (audioUnlockedRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current?.play().catch(() => {});
    }
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
      body: JSON.stringify({ serverId, channelId }),
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
      body: JSON.stringify({ serverId }),
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
      <audio ref={audioRef} src="/sounds/ping.mp3" preload="auto" />
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
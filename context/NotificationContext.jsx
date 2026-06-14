import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useConnectionStatus } from "@/components/providers/ConnectionStatusProvider";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { data: session } = useSession();
  const connection = useConnectionStatus();

  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const previousMentionTotalRef = useRef(0);
  const loadingRef = useRef(false);

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
    if (!session?.user?.id || !connection.online) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, connection.reconnecting ? 7000 : 3000);

    return () => clearInterval(interval);
  }, [session?.user?.id, loaded, connection.online, connection.reconnecting]);

  useEffect(() => {
    if (!session?.user?.id || !connection.online) return;

    loadNotifications();
  }, [connection.online, connection.pusherState, session?.user?.id]);

  useEffect(() => {
    function handleRetry() {
      if (session?.user?.id) loadNotifications();
    }

    window.addEventListener("connection:retry", handleRetry);
    return () => window.removeEventListener("connection:retry", handleRetry);
  }, [session?.user?.id]);

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
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  async function loadNotifications() {
    if (loadingRef.current || !session?.user?.id) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    try {
      loadingRef.current = true;

      const res = await fetch("/api/notifications", {
        cache: "no-store",
      });
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
    } finally {
      loadingRef.current = false;
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

    if (typeof navigator !== "undefined" && !navigator.onLine) return;

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

    if (typeof navigator !== "undefined" && !navigator.onLine) return;

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

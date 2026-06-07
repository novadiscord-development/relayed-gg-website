import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { getPusherClient } from "@/lib/pusher-client";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationListener() {
  const router = useRouter();
  const { data: session } = useSession();

  const subscribedChannelsRef = useRef(new Set());

  const { addUnread, addMention, clearChannel } = useNotifications();

  useEffect(() => {
    if (!session?.user?.id) return;

    loadSubscriptions();

    return () => {
      unsubscribeAll();
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    function refreshSubscriptions() {
      loadSubscriptions();
    }

    window.addEventListener("server:updated", refreshSubscriptions);
    window.addEventListener("channel:created", refreshSubscriptions);
    window.addEventListener("channel:updated", refreshSubscriptions);
    window.addEventListener("channel:deleted", refreshSubscriptions);
    window.addEventListener("focus", refreshSubscriptions);

    return () => {
      window.removeEventListener("server:updated", refreshSubscriptions);
      window.removeEventListener("channel:created", refreshSubscriptions);
      window.removeEventListener("channel:updated", refreshSubscriptions);
      window.removeEventListener("channel:deleted", refreshSubscriptions);
      window.removeEventListener("focus", refreshSubscriptions);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    const { serverId, channelId } = router.query;

    if (serverId && channelId) {
      clearChannel(serverId, channelId);
    }
  }, [router.query.serverId, router.query.channelId]);

  function unsubscribeAll() {
    const pusherClient = getPusherClient();

    subscribedChannelsRef.current.forEach((channelName) => {
      pusherClient.unsubscribe(channelName);
    });

    subscribedChannelsRef.current.clear();
  }

  async function loadSubscriptions() {
    try {
      const pusherClient = getPusherClient();

      const serversRes = await fetch("/api/servers/get-servers");
      const serversData = await serversRes.json();

      const servers = serversData.servers || [];

      for (const server of servers) {
        const channelsRes = await fetch(
          `/api/channels/get-channels?serverId=${server._id}`
        );

        const channelsData = await channelsRes.json();
        const channels = channelsData.channels || [];

        channels
          .filter((channel) => channel.type === "text")
          .forEach((channel) => {
            const channelName = `channel-${channel._id}`;

            if (subscribedChannelsRef.current.has(channelName)) return;

            subscribedChannelsRef.current.add(channelName);

            const pusherChannel = pusherClient.subscribe(channelName);

            pusherChannel.bind("message:new", (message) => {
              handleIncomingMessage({
                serverId: server._id,
                channelId: channel._id,
                message,
              });
            });
          });
      }
    } catch (error) {
      console.error("LOAD_NOTIFICATION_SUBSCRIPTIONS_ERROR", error);
    }
  }

  function handleIncomingMessage({ serverId, channelId, message }) {
    const activeServerId = router.query.serverId;
    const activeChannelId = router.query.channelId;

    const authorId = message.authorId?._id || message.authorId;

    if (authorId?.toString() === session?.user?.id) return;

    const viewingChannel =
      activeServerId === serverId && activeChannelId === channelId;

    if (viewingChannel) return;

    if (messageMentionsMe(message)) {
      addMention(serverId, channelId);
      return;
    }

    addUnread(serverId, channelId);
  }

  function messageMentionsMe(message) {
    const username = session?.user?.username || session?.user?.name;

    if (!message?.content || !username) return false;

    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(
      `(^|\\s)@${escaped}(?=\\s|$|[.,!?])`,
      "i"
    ).test(message.content);
  }

  return null;
}
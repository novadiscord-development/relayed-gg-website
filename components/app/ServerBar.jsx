import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Plus, Compass } from "lucide-react";
import CreateServerModal from "@/components/modals/CreateServerModal";
import { useNotifications } from "@/context/NotificationContext";
import { getPusherClient } from "@/lib/pusher-client";
import { useSession } from "next-auth/react";

export default function ServerBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { getServerNotification } = useNotifications();

  const [servers, setServers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dmUnread, setDmUnread] = useState(false);

  const activeServerId = router.query.serverId;
  const isHomeActive = !activeServerId && !router.pathname.startsWith("/app/explore");
  const isExploreActive = router.pathname === "/app/explore";

  useEffect(() => {
    loadServers();
    loadDMUnread();

    function openCreateServer() {
      setShowModal(true);
    }

    window.addEventListener("open:create-server", openCreateServer);

    return () => {
      window.removeEventListener("open:create-server", openCreateServer);
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const pusherClient = getPusherClient();
    const channelName = `user-${session.user.id}`;
    const userChannel = pusherClient.subscribe(channelName);

    function handleDMUpdate({ unread }) {
      if (unread && !router.pathname.startsWith("/app/me")) {
        setDmUnread(true);
      }
    }

    userChannel.bind("dm:conversation:update", handleDMUpdate);

    return () => {
      userChannel.unbind("dm:conversation:update", handleDMUpdate);
      pusherClient.unsubscribe(channelName);
    };
  }, [session?.user?.id, router.pathname]);

  useEffect(() => {
    if (router.pathname.startsWith("/app/me")) {
      setDmUnread(false);
    } else {
      loadDMUnread();
    }
  }, [router.pathname, router.query.conversationId]);

  useEffect(() => {
    function refreshServers() {
      loadServers();
    }

    function refreshAll() {
      loadServers();
      loadDMUnread();
    }

    window.addEventListener("server:updated", refreshServers);
    window.addEventListener("server:deleted", refreshServers);
    window.addEventListener("server:joined", refreshServers);
    window.addEventListener("focus", refreshAll);

    return () => {
      window.removeEventListener("server:updated", refreshServers);
      window.removeEventListener("server:deleted", refreshServers);
      window.removeEventListener("server:joined", refreshServers);
      window.removeEventListener("focus", refreshAll);
    };
  }, []);

  async function loadServers() {
    try {
      const res = await fetch("/api/servers/get-servers");
      const data = await res.json();

      setServers(data.servers || []);
    } catch (error) {
      console.error("LOAD_SERVERS_ERROR", error);
    }
  }

  async function loadDMUnread() {
    try {
      const res = await fetch("/api/dms/get-conversations", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        const hasUnread = (data.conversations || []).some(
          (conversation) => conversation.notification?.unread
        );

        setDmUnread(hasUnread);
      }
    } catch (error) {
      console.error("LOAD_DM_UNREAD_ERROR", error);
    }
  }

  function getServerInitials(name) {
    return name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function handleServerCreated(data) {
    setServers((prev) => [...prev, data.server]);
    router.push(`/app/server/${data.server._id}`);
  }

  return (
    <>
      <aside className="flex w-[76px] flex-col items-center gap-4 border-r border-white/10 bg-[#070a15] py-4">
        <button
          onClick={() => router.push("/app/me")}
          title="Home"
          className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border transition hover:rounded-xl ${
            isHomeActive
              ? "border-violet-400 bg-violet-600/30 shadow-[0_0_25px_rgba(124,58,237,0.5)]"
              : "border-white/10 bg-white/[0.04] hover:border-violet-400/50 hover:bg-violet-600/20"
          }`}
        >
          {isHomeActive && (
            <span className="absolute -left-3 h-8 w-1 rounded-r-full bg-violet-400" />
          )}

          <Image
            src="/logo.png"
            alt="relayed.gg"
            width={36}
            height={36}
            className="rounded-full"
          />

          {dmUnread && !router.pathname.startsWith("/app/me") && (
            <span className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#070a15] bg-white" />
          )}
        </button>

        <div className="h-px w-10 bg-white/10" />

        {servers.map((server) => {
          const isActive = activeServerId === server._id;
          const notification = getServerNotification(server._id);

          return (
            <button
              key={server._id}
              onClick={() => router.push(`/app/server/${server._id}`)}
              title={server.name}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition hover:rounded-xl ${
                isActive
                  ? "border-violet-400 bg-violet-600/30 shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                  : "border-white/10 bg-white/[0.04] hover:border-violet-400/50 hover:bg-violet-600/20"
              }`}
            >
              {isActive && (
                <span className="absolute -left-3 h-8 w-1 rounded-r-full bg-violet-400" />
              )}

              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl">
                {server.icon ? (
                  <Image
                    src={server.icon}
                    alt={server.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="select-none text-sm font-black tracking-wide text-white">
                    {getServerInitials(server.name)}
                  </span>
                )}
              </div>

              {notification.mentions > 0 ? (
                <div className="absolute -bottom-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full border-4 border-[#070a15] bg-red-500 px-1 text-xs font-black text-white">
                  {notification.mentions > 99 ? "99+" : notification.mentions}
                </div>
              ) : notification.unread && !isActive ? (
                <div className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#070a15] bg-white" />
              ) : null}
            </button>
          );
        })}

        <button
          onClick={() => setShowModal(true)}
          title="Create Server"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-green-400 transition hover:rounded-xl hover:bg-green-500/10"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => router.push("/app/explore")}
          title="Explore Servers"
          className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition hover:rounded-xl ${
            isExploreActive
              ? "border-violet-400 bg-violet-600/30 text-violet-200 shadow-[0_0_25px_rgba(124,58,237,0.5)]"
              : "border-white/10 bg-white/[0.04] text-violet-300 hover:bg-violet-500/10"
          }`}
        >
          {isExploreActive && (
            <span className="absolute -left-3 h-8 w-1 rounded-r-full bg-violet-400" />
          )}
          <Compass size={22} />
        </button>
      </aside>

      <CreateServerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onServerCreated={handleServerCreated}
      />
    </>
  );
}

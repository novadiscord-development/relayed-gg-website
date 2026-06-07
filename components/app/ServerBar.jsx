import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Plus, Compass } from "lucide-react";
import CreateServerModal from "@/components/modals/CreateServerModal";
import { useNotifications } from "@/context/NotificationContext";

export default function ServerBar() {
  const router = useRouter();
  const { getServerNotification } = useNotifications();

  const [servers, setServers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const activeServerId = router.query.serverId;

  useEffect(() => {
    loadServers();
  }, []);

  useEffect(() => {
    function refreshServers() {
      loadServers();
    }

    window.addEventListener("server:updated", refreshServers);
    window.addEventListener("server:deleted", refreshServers);
    window.addEventListener("focus", refreshServers);

    return () => {
      window.removeEventListener("server:updated", refreshServers);
      window.removeEventListener("server:deleted", refreshServers);
      window.removeEventListener("focus", refreshServers);
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
          onClick={() => router.push("/app")}
          title="Home"
          className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border transition hover:rounded-xl ${
            !activeServerId
              ? "border-violet-400 bg-violet-600/30 shadow-[0_0_25px_rgba(124,58,237,0.5)]"
              : "border-white/10 bg-white/[0.04] hover:border-violet-400/50 hover:bg-violet-600/20"
          }`}
        >
          {!activeServerId && (
            <span className="absolute -left-3 h-8 w-1 rounded-r-full bg-violet-400" />
          )}

          <Image
            src="/logo.png"
            alt="relayed.gg"
            width={36}
            height={36}
            className="rounded-full"
          />
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
          title="Explore Servers"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-violet-300 transition hover:rounded-xl hover:bg-violet-500/10"
        >
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
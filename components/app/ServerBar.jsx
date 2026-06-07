import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Plus, Compass } from "lucide-react";
import CreateServerModal from "@/components/modals/CreateServerModal";

export default function ServerBar() {
  const router = useRouter();

  const [servers, setServers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const activeServerId = router.query.serverId;

  useEffect(() => {
    loadServers();
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

          return (
            <button
              key={server._id}
              onClick={() => router.push(`/app/server/${server._id}`)}
              title={server.name}
              className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border transition hover:rounded-xl ${
                isActive
                  ? "border-violet-400 bg-violet-600/30 shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                  : "border-white/10 bg-white/[0.04] hover:border-violet-400/50 hover:bg-violet-600/20"
              }`}
            >
              {isActive && (
                <span className="absolute -left-3 h-8 w-1 rounded-r-full bg-violet-400" />
              )}

              {server.icon ? (
                <Image
                  src={server.icon}
                  alt={server.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-black tracking-wide">
                  {server.name
                    ?.split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
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
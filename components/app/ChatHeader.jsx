import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Hash, Bell, Pin, Users, Search } from "lucide-react";

export default function ChatHeader() {
  const router = useRouter();
  const { serverId, channelId } = router.query;

  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!serverId || !channelId) return;

    loadChannel();
  }, [serverId, channelId]);

  async function loadChannel() {
    const res = await fetch(`/api/channels/get-channels?serverId=${serverId}`);
    const data = await res.json();

    const currentChannel = data.channels?.find(
      (item) => item._id === channelId
    );

    setChannel(currentChannel || null);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#080b18]/80 px-5 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <Hash size={24} className="text-slate-400" />

        <h1 className="truncate font-black">
          {channel?.name || "loading"}
        </h1>

        <div className="hidden h-6 w-px bg-white/10 md:block" />

        <p className="hidden truncate text-sm text-slate-400 md:block">
          This is the start of #{channel?.name || "this channel"}.
        </p>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <Bell size={20} className="hover:text-white" />
        <Pin size={20} className="hover:text-white" />
        <Users size={20} className="hover:text-white" />

        <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 lg:flex">
          <input
            placeholder="Search"
            className="w-32 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          <Search size={16} />
        </div>
      </div>
    </header>
  );
}
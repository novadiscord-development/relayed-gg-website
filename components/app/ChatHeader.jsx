import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Hash, Bell, Pin, Users, Search } from "lucide-react";

export default function ChatHeader() {
  const router = useRouter();
  const { serverId, channelId } = router.query;

  const [channel, setChannel] = useState(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!serverId || !channelId) return;
    loadChannel();
  }, [serverId, channelId]);

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

function jumpToMessage(message) {
  console.log("JUMPING TO", message._id);

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
        <Bell size={20} className="hover:text-white" />
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
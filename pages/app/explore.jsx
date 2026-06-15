import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import ServerBar from "@/components/app/ServerBar";
import {
  Compass,
  Search,
  Users,
  Tag,
  ArrowRight,
  Check,
  RefreshCw,
} from "lucide-react";

const suggestedTags = [
  "gaming",
  "friends",
  "music",
  "coding",
  "community",
  "study",
  "chill",
];

function getInitials(name) {
  return name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function ExploreServersPage() {
  const router = useRouter();

  const [servers, setServers] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPublicServers();
  }, []);

  async function loadPublicServers(options = {}) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      const nextQuery = options.query ?? query;
      const nextTag = options.tag ?? activeTag;

      if (nextQuery) params.set("q", nextQuery);
      if (nextTag) params.set("tag", nextTag);

      const res = await fetch(`/api/explore/get-public-servers?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load public servers");
        return;
      }

      setServers(data.servers || []);
    } catch (error) {
      console.error("LOAD_PUBLIC_SERVERS_ERROR", error);
      setError("Failed to load public servers");
    } finally {
      setLoading(false);
    }
  }

  async function searchServers(event) {
    event?.preventDefault?.();
    await loadPublicServers({ query, tag: activeTag });
  }

  async function selectTag(tag) {
    const nextTag = activeTag === tag ? "" : tag;
    setActiveTag(nextTag);
    await loadPublicServers({ query, tag: nextTag });
  }

  async function joinServer(server) {
    if (server.joined) {
      router.push(`/app/server/${server.publicId}`);
      return;
    }

    if (joiningId) return;

    try {
      setJoiningId(server._id);
      setError("");

      const res = await fetch("/api/explore/join-public-server", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId: server._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to join server");
        return;
      }

      window.dispatchEvent(new Event("server:joined"));

      if (data.channel?._id) {
        router.push(`/app/server/${server.publicId}/${data.channel.publicId}`);
      } else {
        router.push(`/app/server/${server.publicId}`);
      }
    } catch (error) {
      console.error("JOIN_PUBLIC_SERVER_ERROR", error);
      setError("Failed to join server");
    } finally {
      setJoiningId(null);
    }
  }

  const visibleTags = useMemo(() => {
    const allTags = new Set(suggestedTags);

    servers.forEach((server) => {
      (server.tags || []).forEach((tag) => {
        if (tag) allTags.add(tag);
      });
    });

    return Array.from(allTags).slice(0, 12);
  }, [servers]);

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-[#050712] text-white">
      <ServerBar />

      <section className="min-w-0 flex-1 overflow-y-auto">
        <div className="relative overflow-hidden border-b border-white/10 bg-[#0b0f1d] px-6 py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c3aed44,transparent_38%)]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-violet-200 shadow-[0_0_35px_rgba(124,58,237,0.25)]">
                <Compass size={28} />
              </div>

              <div>
                <h1 className="text-4xl font-black">Explore Servers</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Find public communities to join on relayed.gg.
                </p>
              </div>
            </div>

            <form
              onSubmit={searchServers}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <Search size={19} className="shrink-0 text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search servers, tags, or descriptions"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-violet-600 px-6 py-3 text-sm font-black text-white transition hover:bg-violet-500"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => loadPublicServers()}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => selectTag(tag)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    activeTag === tag
                      ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                      : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <Tag size={12} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_45px_rgba(124,58,237,0.25)]">
                  <div className="absolute inset-0 animate-ping rounded-3xl border border-violet-400/30" />
                  <img
                    src="/logo.png"
                    alt="Relayed"
                    className="relative h-10 w-10 rounded-full"
                  />
                </div>

                <div>
                  <p className="text-lg font-black text-white">
                    Loading Explore...
                  </p>
                  <p className="text-sm text-slate-500">
                    Finding public communities.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                  >
                    <div className="h-28 animate-pulse bg-white/[0.06]" />
                    <div className="px-5 pb-5 pt-11">
                      <div className="mb-3 h-5 w-40 animate-pulse rounded bg-white/[0.08]" />
                      <div className="mb-5 h-3 w-24 animate-pulse rounded bg-white/[0.05]" />
                      <div className="space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-white/[0.04]" />
                        <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.04]" />
                      </div>
                      <div className="mt-5 h-11 animate-pulse rounded-xl bg-white/[0.06]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : servers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
              <Compass size={38} className="mx-auto text-slate-600" />
              <h2 className="mt-4 text-xl font-black text-white">
                No public servers found
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search, or make one of your servers public.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {servers.map((server) => (
                <article
                  key={server._id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.05]"
                >
                  <div
                    className="relative h-28 bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-500"
                    style={
                      server.banner
                        ? {
                            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(11,15,29,0.65)), url(${server.banner})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    <div className="absolute -bottom-8 left-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#0b0f1d] bg-[#111827] text-lg font-black text-white">
                      {server.icon ? (
                        <Image
                          src={server.icon}
                          alt={server.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(server.name)
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-11">
                    <h2 className="truncate text-lg font-black text-white">
                      {server.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Users size={14} />
                      <span>
                        {server.memberCount || 0} member
                        {(server.memberCount || 0) === 1 ? "" : "s"}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-400">
                      {server.description || "No description has been added yet."}
                    </p>

                    {server.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {server.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-bold text-violet-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => joinServer(server)}
                      disabled={joiningId === server._id}
                      className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition disabled:opacity-60 ${
                        server.joined
                          ? "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                          : "bg-violet-600 text-white hover:bg-violet-500"
                      }`}
                    >
                      {joiningId === server._id ? (
                        "Joining..."
                      ) : server.joined ? (
                        <>
                          <Check size={16} />
                          Open Server
                        </>
                      ) : (
                        <>
                          Join Server
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

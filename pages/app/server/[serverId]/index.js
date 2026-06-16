import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import ServerBar from "@/components/app/ServerBar";
import ChannelSidebar from "@/components/app/ChannelSidebar";
import MemberSidebar from "@/components/app/MemberSidebar";
import { CircleQuestionMarkIcon, Server, Menu, Users, X } from "lucide-react";


function RelayedLoadingScreen({
  title = "Loading...",
  subtitle = "Getting things ready.",
  mode = "server",
}) {
  return (
    <main className="flex h-[100dvh] overflow-hidden bg-[#050712] text-white">
      <div className="hidden w-[76px] shrink-0 border-r border-white/10 bg-[#070a15] py-4 md:block">
        <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="mx-auto h-px w-10 bg-white/10" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>

      <div className="hidden w-[270px] shrink-0 border-r border-white/10 bg-[#0b0f1d] p-4 md:block">
        <div className="h-10 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="mt-6 space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-white/[0.08]" />
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-lg bg-white/[0.04]" />
          ))}
        </div>
      </div>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="h-14 shrink-0 border-b border-white/10 bg-[#080b18]" />

        <div className="min-h-0 flex-1 px-4 py-5 md:px-6">
          <div className="mb-8 flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_45px_rgba(124,58,237,0.25)]">
              <div className="absolute inset-0 animate-ping rounded-3xl border border-violet-400/30" />
              <img src="/logo.png" alt="Relayed" className="relative h-10 w-10 rounded-full" />
            </div>

            <div>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          <div className="space-y-5">
            {Array.from({ length: mode === "server" ? 5 : 9 }).map((_, index) => (
              <div key={index} className="flex animate-pulse gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-white/[0.06]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-32 rounded bg-white/[0.07]" />
                  <div className={`h-3 rounded bg-white/[0.04] ${index % 3 === 0 ? "w-4/5" : index % 3 === 1 ? "w-2/3" : "w-1/2"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hidden w-[280px] shrink-0 border-l border-white/10 bg-[#0b0f1d] p-4 xl:block">
        <div className="h-10 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-2 w-16 animate-pulse rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


export default function ServerRedirectPage() {
  const router = useRouter();
  const { serverId } = router.query;

  const [loading, setLoading] = useState(true);
  const [hasNoChannels, setHasNoChannels] = useState(false);

  const [serverDrawerOpen, setServerDrawerOpen] = useState(false);
  const [channelDrawerOpen, setChannelDrawerOpen] = useState(false);
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);

  const anyDrawerOpen =
    serverDrawerOpen || channelDrawerOpen || memberDrawerOpen;

  useEffect(() => {
    if (!serverId) return;

    loadChannels();
  }, [serverId]);

  function closeDrawers() {
    setServerDrawerOpen(false);
    setChannelDrawerOpen(false);
    setMemberDrawerOpen(false);
  }

  async function loadChannels() {
    try {
      setLoading(true);
      setHasNoChannels(false);

      const res = await fetch(
        `/api/channels/get-channels?serverId=${serverId}`
      );

      const data = await res.json();

      if (res.status === 401) {
        router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
        return;
      }

      if (res.status === 403) {
        router.replace("/403");
        return;
      }

      if (res.status === 404) {
        router.replace("/404");
        return;
      }

      if (!res.ok) {
        setHasNoChannels(true);
        return;
      }

      const firstChannel = data.firstTextChannel;

      if (!firstChannel) {
        setHasNoChannels(true);
        return;
      }

      router.replace(`/app/server/${serverId}/${firstChannel._id}`);
    } catch (error) {
      console.error("SERVER_REDIRECT_ERROR", error);
      setHasNoChannels(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !hasNoChannels) {
    return (
      <RelayedLoadingScreen
        title="Loading server..."
        subtitle="Checking access and finding your first channel."
        mode="server"
      />
    );
  }

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-[#050712] text-white">
      <ServerBar />

      <ChannelSidebar
        mobileOpen={channelDrawerOpen}
        onMobileClose={closeDrawers}
      />

      {anyDrawerOpen && (
        <button
          type="button"
          onClick={closeDrawers}
          className="fixed inset-0 z-[10010] bg-black/60 backdrop-blur-sm md:hidden"
          aria-label="Close mobile drawer"
        />
      )}

      {serverDrawerOpen && (
        <div className="fixed inset-y-0 left-0 z-[10030] w-[86vw] max-w-[320px] border-r border-white/10 bg-[#070a15] shadow-2xl md:hidden">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <p className="font-black text-white">Servers</p>
            <button
              type="button"
              onClick={closeDrawers}
              className="rounded-lg border border-white/10 p-2 text-slate-300"
            >
              <X size={17} />
            </button>
          </div>

          <ServerBar mobile onNavigate={closeDrawers} />
        </div>
      )}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0f1d] px-3 md:hidden">
          <button
            type="button"
            onClick={() => {
              setServerDrawerOpen(true);
              setChannelDrawerOpen(false);
              setMemberDrawerOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200"
            aria-label="Open servers"
          >
            <Server size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              setChannelDrawerOpen(true);
              setServerDrawerOpen(false);
              setMemberDrawerOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white"
          >
            <Menu size={18} />
            Channels
          </button>

          <button
            type="button"
            onClick={() => {
              setMemberDrawerOpen(true);
              setServerDrawerOpen(false);
              setChannelDrawerOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200"
            aria-label="Open members"
          >
            <Users size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl">
              <CircleQuestionMarkIcon size={38} className="text-violet-400" />
            </div>

            <h2 className="text-3xl font-black">NO TEXT CHANNELS</h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              You find yourself in a weird place. You don&apos;t have access to
              any text channels, or this server does not have one yet.
            </p>
          </div>
        </div>
      </section>

      <MemberSidebar
        mobileOpen={memberDrawerOpen}
        onMobileClose={closeDrawers}
      />
    </main>
  );
}

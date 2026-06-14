import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import ServerBar from "@/components/app/ServerBar";
import ChannelSidebar from "@/components/app/ChannelSidebar";
import MemberSidebar from "@/components/app/MemberSidebar";
import { CircleQuestionMarkIcon, Server, Menu, Users, X } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#050712] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />

        <h2 className="font-bold">Loading server...</h2>

        <p className="mt-2 text-sm text-slate-500">
          Checking access and finding your first channel.
        </p>
      </div>
    </div>
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

      router.replace(`/app/server/${serverId}/channel/${firstChannel._id}`);
    } catch (error) {
      console.error("SERVER_REDIRECT_ERROR", error);
      setHasNoChannels(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !hasNoChannels) {
    return <LoadingScreen />;
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

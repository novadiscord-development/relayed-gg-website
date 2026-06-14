import { useState } from "react";
import ServerBar from "@/components/app/ServerBar";
import ChannelSidebar from "@/components/app/ChannelSidebar";
import ChatHeader from "@/components/app/ChatHeader";
import ChatArea from "@/components/app/ChatArea";
import MemberSidebar from "@/components/app/MemberSidebar";
import { Menu, Server, Users, X } from "lucide-react";

export default function ServerChannelPage() {
  const [serverDrawerOpen, setServerDrawerOpen] = useState(false);
  const [channelDrawerOpen, setChannelDrawerOpen] = useState(false);
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);

  const anyDrawerOpen =
    serverDrawerOpen || channelDrawerOpen || memberDrawerOpen;

  function closeDrawers() {
    setServerDrawerOpen(false);
    setChannelDrawerOpen(false);
    setMemberDrawerOpen(false);
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

        <ChatHeader />
        <ChatArea />
      </section>

      <MemberSidebar
        mobileOpen={memberDrawerOpen}
        onMobileClose={closeDrawers}
      />
    </main>
  );
}

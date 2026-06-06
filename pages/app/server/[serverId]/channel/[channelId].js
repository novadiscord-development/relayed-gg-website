import ServerBar from "@/components/app/ServerBar";
import ChannelSidebar from "@/components/app/ChannelSidebar";
import ChatHeader from "@/components/app/ChatHeader";
import ChatArea from "@/components/app/ChatArea";
import MemberSidebar from "@/components/app/MemberSidebar";

export default function ServerChannelPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
      <ServerBar />
      <ChannelSidebar />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader />
        <ChatArea />
      </section>

      <MemberSidebar />
    </main>
  );
}
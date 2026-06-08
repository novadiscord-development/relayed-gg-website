import ServerBar from "@/components/app/ServerBar";
import DMChannelSidebar from "@/components/dms/DMChannelSidebar";
import { MessageCircle } from "lucide-react";

export default function DMConversationPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
      <ServerBar />
      <DMChannelSidebar />

      <section className="flex min-w-0 flex-1 items-center justify-center">
        <div className="text-center">
          <MessageCircle size={42} className="mx-auto mb-4 text-violet-400" />
          <h1 className="text-2xl font-black">DM conversation</h1>
          <p className="mt-2 text-sm text-slate-500">
            Next we’ll add the message list and input here.
          </p>
        </div>
      </section>
    </main>
  );
}
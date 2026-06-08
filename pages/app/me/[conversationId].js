import ServerBar from "@/components/app/ServerBar";
import DMChannelSidebar from "@/components/dms/DMChannelSidebar";
import DMChatArea from "@/components/dms/DMChatArea";
import Head from "next/head";

export default function DMConversationPage() {
  return (
    <><Head>
        <title>Relayed.gg</title>
      </Head>
      <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
              <ServerBar />
              <DMChannelSidebar />
              <DMChatArea />
          </main>
          </>
  );
}
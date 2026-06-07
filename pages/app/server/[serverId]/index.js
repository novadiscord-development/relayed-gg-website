import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import ServerBar from "@/components/app/ServerBar";
import ChannelSidebar from "@/components/app/ChannelSidebar";
import MemberSidebar from "@/components/app/MemberSidebar";
import { Hash, Plus, FileQuestionIcon, LucideFileQuestionMark, CircleQuestionMarkIcon} from "lucide-react";

export default function ServerRedirectPage() {
  const router = useRouter();
  const { serverId } = router.query;

  const [loading, setLoading] = useState(true);
  const [hasNoChannels, setHasNoChannels] = useState(false);

  useEffect(() => {
    if (!serverId) return;

    loadChannels();
  }, [serverId]);

  async function loadChannels() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/channels/get-channels?serverId=${serverId}`
      );

      const data = await res.json();

      const firstChannel = data.firstTextChannel;

      if (!firstChannel) {
        setHasNoChannels(true);
        setLoading(false);
        return;
      }

      router.replace(`/app/server/${serverId}/channel/${firstChannel._id}`);
    } catch (error) {
      console.error("SERVER_REDIRECT_ERROR", error);
      setHasNoChannels(true);
      setLoading(false);
    }
  }

  if (loading && !hasNoChannels) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050712] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />

          <h2 className="font-bold">Loading server...</h2>

          <p className="mt-2 text-sm text-slate-500">
            This may take some time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
      <ServerBar />
      <ChannelSidebar />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ">
              <CircleQuestionMarkIcon size={38} className="text-violet-400" />
            </div>

            <h2 className="text-3xl font-black">
              NO TEXT CHANNELS
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              You find yourself in a weird place. You don&apos;t have access to any text channels or there is none in this server.
            </p>
          </div>
        </div>
      </section>

      <MemberSidebar />
    </main>
  );
}
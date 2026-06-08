import { Megaphone } from "lucide-react";

export default function AnnouncementBar() {
  const message = "RIP TWOSLA 😭";

  return (
    <div className="relative z-[999] flex h-9 items-center justify-center border-b border-violet-500/20 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 px-4 text-sm font-bold text-white shadow-lg">
      <div className="flex items-center gap-2">
        <Megaphone size={14} />
        <span>{message}</span>
      </div>
    </div>
  );
}
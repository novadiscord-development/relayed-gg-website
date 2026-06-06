import Image from "next/image";
import { Mic, Headphones, Settings } from "lucide-react";

export default function UserPanel() {
  return (
    <div className="flex h-16 items-center justify-between border-t border-white/10 bg-[#070a15] px-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative">
          <Image
            src="/logo.png"
            alt="avatar"
            width={38}
            height={38}
            className="rounded-full"
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#070a15] bg-green-500" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold">Snorbloof</p>
          <p className="text-xs text-green-400">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <Mic size={18} className="hover:text-white" />
        <Headphones size={18} className="hover:text-white" />
        <Settings size={18} className="hover:text-white" />
      </div>
    </div>
  );
}
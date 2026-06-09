import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Mic,
  Headphones,
  Settings,
  ChevronRight,
  Circle,
  Moon,
  MinusCircle,
} from "lucide-react";
import UserSettingsModal from "@/components/settings/UserSettingsModal";

export default function UserPanel() {
  const { data: session } = useSession();

  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState("online");
  const [customStatus, setCustomStatus] = useState("");

  const user = session?.user;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function updateStatus(
    nextStatus = status,
    nextCustomStatus = customStatus
  ) {
    setStatus(nextStatus);
    setCustomStatus(nextCustomStatus);

    await fetch("/api/presence/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
        customStatus: nextCustomStatus,
      }),
    }).catch(() => {});
  }

  function openSettings() {
    setOpen(false);
    setSettingsOpen(true);
  }

  function getStatusLabel() {
    if (customStatus?.trim()) return customStatus.trim();
    if (status === "dnd") return "Do Not Disturb";
    if (status === "idle") return "Idle";
    return "Online";
  }

  function getStatusColor() {
    if (status === "dnd") return "bg-red-500";
    if (status === "idle") return "bg-yellow-400";
    return "bg-green-500";
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        {open && (
          <div className="absolute bottom-[72px] left-3 right-3 z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-150 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
            <div className="bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={user?.image || user?.avatar || "/logo.png"}
                    alt={user?.username || user?.name || "User"}
                    width={54}
                    height={54}
                    className="h-[54px] w-[54px] rounded-full border-2 border-white/20 object-cover"
                  />

                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#111827] ${getStatusColor()}`}
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-black text-white">
                    {user?.username || user?.name || "User"}
                  </p>
                  <p className="text-xs font-medium text-slate-300">
                    {getStatusLabel()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={() => updateStatus("online")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <Circle size={15} className="fill-green-500 text-green-500" />
                Online
                {status === "online" && (
                  <ChevronRight size={15} className="ml-auto text-slate-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => updateStatus("idle")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <Moon size={15} className="fill-yellow-400 text-yellow-400" />
                Idle
                {status === "idle" && (
                  <ChevronRight size={15} className="ml-auto text-slate-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => updateStatus("dnd")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <MinusCircle size={15} className="fill-red-500 text-red-500" />
                Do Not Disturb
                {status === "dnd" && (
                  <ChevronRight size={15} className="ml-auto text-slate-500" />
                )}
              </button>

              <input
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateStatus(status, customStatus);
                  }
                }}
                placeholder="Set a custom status"
                maxLength={80}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
              />

              <div className="my-2 h-px bg-white/10" />

              <button
                type="button"
                onClick={openSettings}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                User Settings
                <Settings size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="flex h-16 items-center justify-between border-t border-white/10 bg-[#070a15] px-3">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.06]"
          >
            <div className="relative shrink-0">
              <Image
                src={user?.image || user?.avatar || "/logo.png"}
                alt={user?.username || user?.name || "User"}
                width={38}
                height={38}
                className="h-[38px] w-[38px] rounded-full object-cover"
              />

              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#070a15] ${getStatusColor()}`}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user?.username || user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {getStatusLabel()}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 text-slate-400">
            <Mic size={18} className="cursor-pointer hover:text-white" />
            <Headphones size={18} className="cursor-pointer hover:text-white" />
            <button
              type="button"
              onClick={openSettings}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[0.06] hover:text-white"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      <UserSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
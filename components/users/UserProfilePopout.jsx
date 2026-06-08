import Image from "next/image";
import { MessageCircle, AtSign, Shield, X } from "lucide-react";

export default function UserProfilePopout({ user, member, presence, onClose }) {
  if (!user) return null;

  const status = presence?.status || "offline";
  const customStatus = presence?.customStatus || "";

  const statusColor =
    status === "online"
      ? "bg-green-500"
      : status === "idle"
      ? "bg-yellow-400"
      : status === "dnd"
      ? "bg-red-500"
      : "bg-slate-600";

  const statusLabel =
    status === "online"
      ? "Online"
      : status === "idle"
      ? "Idle"
      : status === "dnd"
      ? "Do Not Disturb"
      : "Offline";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-[0_25px_80px_rgba(0,0,0,0.65)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        <div className="h-24 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-white/70 hover:bg-black/50 hover:text-white"
        >
          <X size={17} />
        </button>

        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <div className="relative">
              <Image
                src={user.avatar || user.image || "/logo.png"}
                alt={user.username || user.name || "User"}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-4 border-[#111827] object-cover"
              />

              <span
                className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-[#111827] ${statusColor}`}
              />
            </div>

            {member?.role && (
              <span className="mb-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold capitalize text-slate-300">
                {member.role}
              </span>
            )}
          </div>

          <div className="mt-4">
            <h2 className="truncate text-2xl font-black text-white">
              {user.username || user.name || "Unknown User"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {customStatus || statusLabel}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {user.isStaff && (
              <span className="flex items-center gap-1 rounded-lg bg-violet-500/15 px-2 py-1 text-xs font-bold text-violet-300">
                ◆ Staff
              </span>
            )}

            {user.isAdmin && (
              <span className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2 py-1 text-xs font-bold text-red-300">
                <Shield size={13} />
                Admin
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500">
              <MessageCircle size={16} />
              Message
            </button>

            <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white">
              <AtSign size={16} />
              Mention
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
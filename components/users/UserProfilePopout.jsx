import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  MessageCircle,
  UserPlus,
  Shield,
  X,
  ExternalLink,
  Check,
  Clock,
  UserCheck,
} from "lucide-react";

export default function UserProfilePopout({ user, member, presence, onClose }) {
  const router = useRouter();

  const [friendLoading, setFriendLoading] = useState(false);
  const [friendMessage, setFriendMessage] = useState("");
  const [friendStatus, setFriendStatus] = useState("none");

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;
    loadFriendStatus();
  }, [userId]);

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

  async function loadFriendStatus() {
    try {
      const res = await fetch(`/api/friends/status?userId=${userId}`);
      const data = await res.json();

      if (res.ok) {
        setFriendStatus(data.status || "none");
      }
    } catch (error) {
      console.error("LOAD_POPOUT_FRIEND_STATUS_ERROR", error);
    }
  }

  async function startDM() {
    if (!userId) return;

    try {
      const res = await fetch("/api/dms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) return;

      onClose?.();
      router.push(`/app/me/${data.conversation._id}`);
    } catch (error) {
      console.error("START_DM_ERROR", error);
    }
  }

  async function sendFriendRequest() {
    if (!userId || friendLoading || friendStatus !== "none") return;

    try {
      setFriendLoading(true);
      setFriendMessage("");

      const res = await fetch("/api/friends/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not send friend request");
        await loadFriendStatus();
        return;
      }

      setFriendStatus("outgoing");
      setFriendMessage("Friend request sent");
    } catch (error) {
      console.error("SEND_POPOUT_FRIEND_REQUEST_ERROR", error);
      setFriendMessage("Could not send friend request");
    } finally {
      setFriendLoading(false);
    }
  }

  function viewProfile() {
    if (!userId) return;

    onClose?.();
    router.push(`/app/user/${userId}`);
  }

  function renderFriendButton() {
    if (friendStatus === "self") return null;

    if (friendStatus === "friends") {
      return (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 py-3 text-sm font-bold text-green-300"
        >
          <UserCheck size={16} />
          Friends
        </button>
      );
    }

    if (friendStatus === "outgoing") {
      return (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-400"
        >
          <Check size={16} />
          Sent
        </button>
      );
    }

    if (friendStatus === "incoming") {
      return (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 py-3 text-sm font-bold text-yellow-300"
        >
          <Clock size={16} />
          Requested You
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={sendFriendRequest}
        disabled={friendLoading}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus size={16} />
        {friendLoading ? "Sending..." : "Add"}
      </button>
    );
  }

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-[0_25px_80px_rgba(0,0,0,0.75)] animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300"
      >
        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500">
          <div className="absolute inset-0 animate-pulse bg-white/10" />
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-white/70 transition hover:scale-110 hover:bg-black/50 hover:text-white active:scale-95"
        >
          <X size={17} />
        </button>

        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <button
              type="button"
              onClick={viewProfile}
              className="relative transition duration-300 hover:scale-105"
            >
              <Image
                src={user.avatar || user.image || "/logo.png"}
                alt={user.username || user.name || "User"}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-4 border-[#111827] object-cover shadow-xl"
              />

              <span
                className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-[#111827] shadow-lg ${statusColor}`}
              />
            </button>

            {member?.role && (
              <span className="mb-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold capitalize text-slate-300 transition hover:bg-white/[0.1]">
                {member.role}
              </span>
            )}
          </div>

          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={viewProfile}
              className="max-w-full text-left"
            >
              <h2 className="truncate text-2xl font-black text-white hover:underline">
                {user.username || user.name || "Unknown User"}
              </h2>
            </button>

            <p className="mt-1 truncate text-sm text-slate-400">
              {customStatus || statusLabel}
            </p>

            {friendMessage && (
              <p className="mt-2 text-xs font-semibold text-violet-300">
                {friendMessage}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {user.isStaff && (
              <span className="flex items-center gap-1 rounded-lg bg-violet-500/15 px-2 py-1 text-xs font-bold text-violet-300 transition hover:scale-105 hover:bg-violet-500/25">
                ◆ Staff
              </span>
            )}

            {user.isAdmin && (
              <span className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2 py-1 text-xs font-bold text-red-300 transition hover:scale-105 hover:bg-red-500/25">
                <Shield size={13} />
                Admin
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <button
              type="button"
              onClick={startDM}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-[0_10px_30px_rgba(124,58,237,0.35)] active:translate-y-0"
            >
              <MessageCircle size={16} />
              Message
            </button>

            {renderFriendButton()}
          </div>

          <button
            type="button"
            onClick={viewProfile}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white active:translate-y-0"
          >
            <ExternalLink size={16} />
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
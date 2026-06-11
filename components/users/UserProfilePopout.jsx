import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  MessageCircle,
  UserPlus,
  Shield,
  X,
  Check,
  UserCheck,
  Ban,
  Sword,
  MoreHorizontal,
  Clock3,
  UserMinus,
  ShieldBan,
} from "lucide-react";

export default function UserProfilePopout({
  user,
  member,
  presence,
  onClose,
  currentMember,
  serverId,
}) {
  const router = useRouter();

  const [friendLoading, setFriendLoading] = useState(false);
  const [friendMessage, setFriendMessage] = useState("");
  const [friendStatus, setFriendStatus] = useState("none");
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedBy, setBlockedBy] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);

  const userId = user?._id || user?.id;
  const memberId = member?._id;

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

  const currentPermissions = currentMember?.permissions || {};

  const canModerate =
    currentMember &&
    friendStatus !== "self" &&
    currentMember._id !== member?._id &&
    (
      currentPermissions.kickMembers ||
      currentPermissions.banMembers ||
      currentPermissions.timeoutMembers ||
      currentMember.role === "owner" ||
      currentMember.role === "admin" ||
      currentMember.role === "moderator"
    );

  async function loadFriendStatus() {
    try {
      const res = await fetch(`/api/friends/status?userId=${userId}`);
      const data = await res.json();

      if (res.ok) {
        setFriendStatus(data.status || "none");
        setFriendRequestId(data.requestId || null);
        setIsBlocked(Boolean(data.blocked));
        setBlockedBy(Boolean(data.blockedBy));
      }
    } catch (error) {
      console.error("LOAD_POPOUT_FRIEND_STATUS_ERROR", error);
    }
  }

  async function startDM() {
    if (!userId || isBlocked || blockedBy) return;

    try {
      const res = await fetch("/api/dms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not start conversation");
        return;
      }

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not send friend request");
        await loadFriendStatus();
        return;
      }

      setFriendStatus("outgoing");
      setFriendRequestId(data.requestId || null);
      setFriendMessage("Friend request sent");
    } catch (error) {
      console.error("SEND_POPOUT_FRIEND_REQUEST_ERROR", error);
      setFriendMessage("Could not send friend request");
    } finally {
      setFriendLoading(false);
    }
  }

  async function acceptFriendRequest() {
    if (!friendRequestId || friendLoading) return;

    try {
      setFriendLoading(true);
      setFriendMessage("");

      const res = await fetch("/api/friends/respond-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: friendRequestId, action: "accept" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not accept request");
        return;
      }

      setFriendStatus("friends");
      setFriendRequestId(null);
      setFriendMessage("Friend request accepted");
    } catch (error) {
      console.error("ACCEPT_POPOUT_FRIEND_REQUEST_ERROR", error);
      setFriendMessage("Could not accept request");
    } finally {
      setFriendLoading(false);
    }
  }

  async function removeFriend() {
    if (!userId || friendLoading) return;
    if (!confirm("Remove this friend?")) return;

    try {
      setFriendLoading(true);
      setFriendMessage("");

      const res = await fetch("/api/friends/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not remove friend");
        return;
      }

      setFriendStatus("none");
      setFriendRequestId(null);
      setFriendMessage("Friend removed");
    } catch (error) {
      console.error("REMOVE_POPOUT_FRIEND_ERROR", error);
      setFriendMessage("Could not remove friend");
    } finally {
      setFriendLoading(false);
    }
  }

  async function blockUser() {
    if (!userId || friendLoading) return;
    if (!confirm("Block this user?")) return;

    try {
      setFriendLoading(true);
      setFriendMessage("");

      const res = await fetch("/api/friends/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not block user");
        return;
      }

      setIsBlocked(true);
      setBlockedBy(false);
      setFriendStatus("blocked");
      setFriendRequestId(null);
      setFriendMessage("User blocked");
    } catch (error) {
      console.error("BLOCK_POPOUT_USER_ERROR", error);
      setFriendMessage("Could not block user");
    } finally {
      setFriendLoading(false);
    }
  }

  async function unblockUser() {
    if (!userId || friendLoading) return;

    try {
      setFriendLoading(true);
      setFriendMessage("");

      const res = await fetch("/api/friends/unblock", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not unblock user");
        return;
      }

      setIsBlocked(false);
      setFriendStatus("none");
      setFriendMessage("User unblocked");
    } catch (error) {
      console.error("UNBLOCK_POPOUT_USER_ERROR", error);
      setFriendMessage("Could not unblock user");
    } finally {
      setFriendLoading(false);
    }
  }

  async function kickMember() {
    if (!serverId || !memberId) return;
    if (!confirm(`Kick ${user.username || "this user"}?`)) return;

    const res = await fetch("/api/servers/kick-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId, memberId }),
    });

    if (res.ok) onClose?.();
  }

  async function banMember() {
    if (!serverId || !memberId) return;
    if (!confirm(`Ban ${user.username || "this user"}?`)) return;

    const res = await fetch("/api/servers/ban-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId, memberId }),
    });

    if (res.ok) onClose?.();
  }

  async function timeoutMember() {
    if (!serverId || !memberId) return;

    const duration = prompt(
      "Timeout duration: 5m, 10m, 30m, 1h, 6h, 1d, 1w",
      "1h"
    );

    if (!duration) return;

    const reason = prompt("Reason for timeout", "") || "";

    const res = await fetch("/api/servers/timeout-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId, memberId, duration, reason }),
    });

    if (res.ok) {
      setModerationOpen(false);
      setFriendMessage("User timed out");
    }
  }

  async function removeTimeout() {
    if (!serverId || !memberId) return;

    const res = await fetch("/api/servers/remove-timeout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId, memberId }),
    });

    if (res.ok) {
      setModerationOpen(false);
      setFriendMessage("Timeout removed");
    }
  }

  function viewProfile() {
    if (!userId) return;
    onClose?.();
    router.push(`/app/user/${userId}`);
  }

  function renderFriendButton() {
    if (friendStatus === "self") return null;

    if (isBlocked) {
      return (
        <button
          type="button"
          disabled
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-black text-red-300"
        >
          <Ban size={16} />
          BLOCKED
        </button>
      );
    }

    if (blockedBy) {
      return (
        <button
          type="button"
          disabled
          className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-slate-400"
        >
          UNAVAILABLE
        </button>
      );
    }

    if (friendStatus === "friends") {
      return (
        <button
          type="button"
          onClick={removeFriend}
          disabled={friendLoading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-slate-200 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
        >
          <UserCheck size={16} />
          FRIENDS
        </button>
      );
    }

    if (friendStatus === "outgoing") {
      return (
        <button
          type="button"
          disabled
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-slate-400"
        >
          <Check size={16} />
          SENT
        </button>
      );
    }

    if (friendStatus === "incoming") {
      return (
        <button
          type="button"
          onClick={acceptFriendRequest}
          disabled={friendLoading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-500 disabled:opacity-60"
        >
          <UserCheck size={16} />
          ACCEPT
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={sendFriendRequest}
        disabled={friendLoading}
        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-slate-200 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-60"
      >
        <UserPlus size={16} />
        ADD
      </button>
    );
  }

  const mutualFriendsCount = user.mutualFriends?.length || user.mutualFriendCount || 0;
  const mutualServersCount = user.mutualServers?.length || user.mutualServerCount || 0;
  const roles = member?.roles || [];

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a] text-white shadow-[0_25px_90px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300"
      >
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-500">
          {user.banner && (
            <Image
              src={user.banner}
              alt=""
              fill
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[#0f172a]/80" />

          <div className="absolute right-4 top-4 flex gap-2">
            {canModerate && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModerationOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
                  title="Moderation"
                >
                  <Sword size={18} />
                </button>

                {moderationOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
                    <button
                      type="button"
                      onClick={timeoutMember}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-orange-300 hover:bg-orange-500/10"
                    >
                      Timeout
                      <Clock3 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={removeTimeout}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-green-300 hover:bg-green-500/10"
                    >
                      Remove Timeout
                      <Shield size={15} />
                    </button>

                    <div className="my-1 h-px bg-white/10" />

                    <button
                      type="button"
                      onClick={kickMember}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                    >
                      Kick
                      <UserMinus size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={banMember}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      Ban
                      <ShieldBan size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white/80 backdrop-blur transition hover:bg-black/65 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <button
              type="button"
              onClick={viewProfile}
              className="relative h-28 w-28 overflow-hidden rounded-full border-[7px] border-[#0f172a] bg-[#0f172a] transition hover:scale-[1.03]"
            >
              <Image
                src={user.avatar || user.image || "/logo.png"}
                alt={user.username || user.name || "User"}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />

              <span
                className={`absolute bottom-3 right-3 h-6 w-6 rounded-full border-4 border-[#0f172a] ${statusColor}`}
              />
            </button>

            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={startDM}
                disabled={isBlocked || blockedBy}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MessageCircle size={16} />
                Message
              </button>

              {renderFriendButton()}

              <button
                type="button"
                onClick={viewProfile}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.1] hover:text-white"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={viewProfile}
              className="max-w-full text-left"
            >
              <h2 className="truncate text-2xl font-black leading-tight text-white hover:underline">
                {user.username || user.name || "Unknown User"}
              </h2>
            </button>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
              <span>@{user.username || user.name || "user"}</span>

              {user.pronouns && (
                <>
                  <span>•</span>
                  <span>{user.pronouns}</span>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
              <span>{statusLabel}</span>

              {customStatus && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="truncate">{customStatus}</span>
                </>
              )}
            </div>

            {(mutualFriendsCount > 0 || mutualServersCount > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                {mutualFriendsCount > 0 && (
                  <span>
                    {mutualFriendsCount} Mutual Friend
                    {mutualFriendsCount === 1 ? "" : "s"}
                  </span>
                )}

                {mutualFriendsCount > 0 && mutualServersCount > 0 && (
                  <span>•</span>
                )}

                {mutualServersCount > 0 && (
                  <span>
                    {mutualServersCount} Mutual Server
                    {mutualServersCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            )}

            {friendMessage && (
              <p className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-200">
                {friendMessage}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
              About Me
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {user.bio || "This user has not added a bio yet."}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
              Roles
            </p>

            <div className="flex flex-wrap gap-2">
              {user.isStaff && (
                <span className="rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-300">
                  ◆ Staff
                </span>
              )}

              {user.isAdmin && (
                <span className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-300">
                  <Shield size={13} />
                  Admin
                </span>
              )}

              {roles.map((role) => (
                <span
                  key={role._id}
                  className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-bold"
                  style={{
                    color: role.color || "#c4b5fd",
                    backgroundColor: `${role.color || "#7c3aed"}22`,
                  }}
                >
                  {role.name}
                </span>
              ))}

              {!user.isStaff && !user.isAdmin && roles.length === 0 && (
                <p className="text-sm text-slate-500">No roles yet.</p>
              )}
            </div>
          </div>

          {isBlocked && (
            <button
              type="button"
              onClick={unblockUser}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 py-3 text-sm font-black text-green-300 transition hover:bg-green-500/20"
            >
              <Ban size={16} />
              Unblock User
            </button>
          )}

          {!isBlocked && friendStatus !== "self" && (
            <button
              type="button"
              onClick={blockUser}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/20"
            >
              <Ban size={16} />
              Block User
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
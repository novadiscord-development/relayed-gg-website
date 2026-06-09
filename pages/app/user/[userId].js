import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import ServerBar from "@/components/app/ServerBar";
import {
  MessageCircle,
  Shield,
  UserPlus,
  User2,
  CalendarDays,
  Check,
  UserCheck,
  Ban,
  Users,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = router.query;

  const [profile, setProfile] = useState(null);
  const [presence, setPresence] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [mutualServers, setMutualServers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendMessage, setFriendMessage] = useState("");
  const [friendStatus, setFriendStatus] = useState("none");
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedBy, setBlockedBy] = useState(false);

  useEffect(() => {
    if (!userId) return;

    loadProfile();
    loadFriendStatus();
  }, [userId]);

  async function loadProfile() {
    try {
      setLoading(true);

      const res = await fetch(`/api/users/profile?userId=${userId}`);
      const data = await res.json();

      if (res.ok) {
        setProfile(data.user);
        setPresence(data.presence || null);
        setMutualFriends(data.mutualFriends || []);
        setMutualServers(data.mutualServers || []);
      }
    } catch (error) {
      console.error("LOAD_USER_PROFILE_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

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
      console.error("LOAD_PROFILE_FRIEND_STATUS_ERROR", error);
    }
  }

  async function startDM() {
    if (!userId || isBlocked || blockedBy) return;

    try {
      const res = await fetch("/api/dms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFriendMessage(data.message || "Could not start conversation");
        return;
      }

      router.push(`/app/me/${data.conversation._id}`);
    } catch (error) {
      console.error("START_PROFILE_DM_ERROR", error);
      setFriendMessage("Could not start conversation");
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
      setFriendRequestId(data.requestId || null);
      setFriendMessage("Friend request sent");
    } catch (error) {
      console.error("SEND_PROFILE_FRIEND_REQUEST_ERROR", error);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: friendRequestId,
          action: "accept",
        }),
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
      console.error("ACCEPT_PROFILE_FRIEND_REQUEST_ERROR", error);
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
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error("REMOVE_FRIEND_ERROR", error);
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
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error("BLOCK_USER_ERROR", error);
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
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error("UNBLOCK_USER_ERROR", error);
      setFriendMessage("Could not unblock user");
    } finally {
      setFriendLoading(false);
    }
  }

  function renderBlockButton() {
    if (friendStatus === "self") return null;

    if (blockedBy) {
      return (
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300"
        >
          <Ban size={17} />
          BLOCKED
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={isBlocked ? unblockUser : blockUser}
        disabled={friendLoading}
        className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isBlocked
            ? "border-green-500/20 bg-green-500/10 text-green-300 hover:bg-green-500/20"
            : "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
        }`}
      >
        <Ban size={17} />
        {isBlocked ? "UNBLOCK" : "BLOCK"}
      </button>
    );
  }

  function renderFriendButton() {
    if (friendStatus === "self") return null;

    if (isBlocked) {
      return (
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300"
        >
          <Ban size={17} />
          BLOCKED
        </button>
      );
    }

    if (blockedBy) {
      return (
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-400"
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
          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserCheck size={17} />
          {friendLoading ? "REMOVING..." : "REMOVE FRIEND"}
        </button>
      );
    }

    if (friendStatus === "outgoing") {
      return (
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-400"
        >
          <Check size={17} />
          REQUEST SENT
        </button>
      );
    }

    if (friendStatus === "incoming") {
      return (
        <button
          type="button"
          onClick={acceptFriendRequest}
          disabled={friendLoading}
          className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-bold text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserCheck size={17} />
          {friendLoading ? "ACCEPTING..." : "ACCEPT REQUEST"}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={sendFriendRequest}
        disabled={friendLoading}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus size={17} />
        {friendLoading ? "SENDING..." : "ADD FRIEND"}
      </button>
    );
  }

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
    <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
      <ServerBar />

      <section className="relative min-w-0 flex-1 overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#6d28d933,transparent_40%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative mx-auto max-w-5xl px-6 py-10">
          {loading ? (
            <p className="text-sm text-slate-500">Loading profile...</p>
          ) : !profile ? (
            <p className="text-sm text-slate-500">User not found.</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1d]/90 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
              <div
                className="relative h-52 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500"
                style={
                  profile.banner
                    ? {
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(11,15,29,0.35)), url(${profile.banner})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#0b0f1d]/70" />
              </div>

              <div className="px-8 pb-8">
                <div className="-mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="relative mt-4 h-32 w-32 shrink-0 overflow-hidden rounded-full border-8 border-[#0b0f1d] bg-violet-600 shadow-2xl">
                      <Image
                        src={profile.avatar || profile.image || "/logo.png"}
                        alt={profile.username || profile.name || "User"}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />

                      <span
                        className={`absolute bottom-3 right-3 h-6 w-6 rounded-full border-4 border-[#0b0f1d] ${statusColor}`}
                      />
                    </div>

                    <div className="pt-16">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-black leading-none">
                          {profile.username || profile.name || "Unknown User"}
                        </h1>

                        {profile.pronouns && (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-slate-300">
                            {profile.pronouns}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
                        />
                        <span className="text-sm text-slate-400">
                          {statusLabel}
                        </span>
                      </div>

                      {customStatus && (
                        <p className="mt-2 text-sm text-slate-300">
                          {customStatus}
                        </p>
                      )}

                      {friendMessage && (
                        <p className="mt-3 text-sm text-violet-300">
                          {friendMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-16 md:self-start">
                    <button
                      type="button"
                      onClick={startDM}
                      disabled={isBlocked || blockedBy}
                      className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MessageCircle size={17} />
                      Message
                    </button>

                    {renderBlockButton()}
                    {renderFriendButton()}
                  </div>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
                        About Me
                      </h2>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {profile.bio || "This user has not added a bio yet."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                        <Users size={15} />
                        Mutual Friends
                      </h2>

                      {mutualFriends.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                          No mutual friends yet.
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {mutualFriends.map((friend) => (
                            <button
                              key={friend._id}
                              type="button"
                              onClick={() => router.push(`/app/user/${friend._id}`)}
                              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
                            >
                              <Image
                                src={friend.avatar || friend.image || "/logo.png"}
                                alt={friend.username || "User"}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-full object-cover"
                              />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">
                                  {friend.username || "Unknown User"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Mutual friend
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                        <Server size={15} />
                        Mutual Servers
                      </h2>

                      {mutualServers.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                          No mutual servers yet.
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {mutualServers.map((server) => (
                            <div
                              key={server._id}
                              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                            >
                              <Image
                                src={server.icon || server.image || "/logo.png"}
                                alt={server.name || "Server"}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-xl object-cover"
                              />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">
                                  {server.name || "Unknown Server"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Mutual server
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
                        Badges
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {profile.isStaff && (
                          <span className="rounded-lg bg-violet-500/15 px-3 py-2 text-xs font-bold text-violet-300">
                            ◆ Relayed Staff
                          </span>
                        )}

                        {profile.isAdmin && (
                          <span className="flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300">
                            <Shield size={13} />
                            Admin
                          </span>
                        )}

                        {!profile.isStaff && !profile.isAdmin && (
                          <p className="text-sm text-slate-500">
                            No badges yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
                        Member Since
                      </h2>

                      <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                        <CalendarDays size={16} className="text-violet-400" />
                        {profile.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
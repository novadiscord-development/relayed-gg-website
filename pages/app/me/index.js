import { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import ServerBar from "@/components/app/ServerBar";
import DMChannelSidebar from "@/components/dms/DMChannelSidebar";
import {
  Check,
  Inbox,
  MessageCircle,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

export default function MeHomePage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [friendsRes, requestsRes] = await Promise.all([
        fetch("/api/friends/get-friends"),
        fetch("/api/friends/get-requests"),
      ]);

      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();

      if (friendsRes.ok) setFriends(friendsData.friends || []);

      if (requestsRes.ok) {
        setIncoming(requestsData.incoming || []);
        setOutgoing(requestsData.outgoing || []);
      }
    } catch (error) {
      console.error("LOAD_FRIENDS_HOME_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  async function startDM(userId) {
    const res = await fetch("/api/dms/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = `/app/me/${data.conversation._id}`;
    }
  }

  async function respondRequest(requestId, action) {
    const res = await fetch("/api/friends/respond-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId, action }),
    });

    if (res.ok) loadData();
  }

  const filteredFriends = friends.filter((friend) =>
    (friend.username || friend.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Friends | Relayed.gg</title>
      </Head>

      <main className="flex h-screen overflow-hidden bg-[#050712] text-white">
        <ServerBar />
        <DMChannelSidebar />

        <section className="flex min-w-0 flex-1 flex-col bg-[#080b18]">
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-6">
            <Users size={20} className="text-slate-400" />
            <h1 className="font-black">Friends</h1>

            <div className="mx-3 h-6 w-px bg-white/10" />

            {[
              ["friends", "All"],
              ["pending", `Pending ${incoming.length ? `(${incoming.length})` : ""}`],
              ["add", "Add Friend"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  activeTab === id
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {activeTab === "friends" && (
              <>
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <Search size={16} className="text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search friends"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <h2 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                  All Friends — {filteredFriends.length}
                </h2>

                {loading ? (
                  <p className="text-sm text-slate-500">Loading friends...</p>
                ) : filteredFriends.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No friends yet"
                    text="Add friends to start private conversations."
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredFriends.map((friend) => (
                      <UserRow
                        key={friend._id}
                        user={friend}
                        right={
                          <button
                            onClick={() => startDM(friend._id)}
                            className="rounded-xl bg-white/[0.06] p-2 text-slate-300 hover:bg-violet-600 hover:text-white"
                          >
                            <MessageCircle size={18} />
                          </button>
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "pending" && (
              <div className="space-y-8">
                <div>
                  <h2 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                    Incoming Requests — {incoming.length}
                  </h2>

                  {incoming.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="No incoming requests"
                      text="Friend requests sent to you will appear here."
                    />
                  ) : (
                    <div className="space-y-2">
                      {incoming.map((request) => (
                        <UserRow
                          key={request._id}
                          user={request.fromUserId}
                          subtitle="Incoming friend request"
                          right={
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  respondRequest(request._id, "accept")
                                }
                                className="rounded-xl bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20"
                              >
                                <Check size={18} />
                              </button>

                              <button
                                onClick={() =>
                                  respondRequest(request._id, "decline")
                                }
                                className="rounded-xl bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                    Outgoing Requests — {outgoing.length}
                  </h2>

                  {outgoing.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No outgoing requests.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {outgoing.map((request) => (
                        <UserRow
                          key={request._id}
                          user={request.toUserId}
                          subtitle="Pending"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "add" && (
              <div className="max-w-xl">
                <h2 className="text-2xl font-black">Add Friend</h2>
                <p className="mt-2 text-sm text-slate-500">
                  User search is next. For now, friend requests can be sent from
                  user profiles.
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <UserPlus className="mb-3 text-violet-300" size={28} />
                  <p className="font-bold text-white">Coming next</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Search by username and send friend requests directly here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function UserRow({ user, subtitle, right }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src={user?.avatar || user?.image || "/logo.png"}
          alt={user?.username || user?.name || "User"}
          width={42}
          height={42}
          className="h-[42px] w-[42px] rounded-full object-cover"
        />

        <div className="min-w-0">
          <p className="truncate font-bold text-white">
            {user?.username || user?.name || "Unknown User"}

            {user?.isStaff && (
              <span className="ml-2 text-violet-400">◆</span>
            )}

            {user?.isAdmin && <span className="ml-1 text-red-400">🛡</span>}
          </p>

          <p className="text-xs text-slate-500">{subtitle || "Friend"}</p>
        </div>
      </div>

      {right}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
        <Icon size={26} />
      </div>

      <p className="font-black text-slate-300">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}
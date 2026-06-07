import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function MemberSidebar() {
  const router = useRouter();
  const { serverId } = router.query;

  const [members, setMembers] = useState([]);
  const [presences, setPresences] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!serverId) return;

    loadMembers();
    loadPresence();

    const interval = setInterval(loadPresence, 1000);
    return () => clearInterval(interval);
  }, [serverId]);

  async function loadMembers() {
    const res = await fetch(`/api/members/get-members?serverId=${serverId}`);
    const data = await res.json();

    setMembers(data.members || []);
  }

  async function loadPresence() {
    const res = await fetch(`/api/presence/get?serverId=${serverId}`);
    const data = await res.json();

    if (res.ok) {
      setPresences(data.presences || {});
    }
  }

  function getPresence(userId) {
    return (
      presences?.[userId] || {
        status: "offline",
        customStatus: "",
      }
    );
  }

  function getStatus(userId) {
    return getPresence(userId).status || "offline";
  }

  function getStatusLabel(status) {
    if (status === "online") return "Online";
    if (status === "idle") return "Idle";
    if (status === "dnd") return "Do Not Disturb";
    return "Offline";
  }

  function getDisplayStatus(userId) {
    const presence = getPresence(userId);

    if (presence.status === "offline") {
      return "Offline";
    }

    return presence.customStatus?.trim() || getStatusLabel(presence.status);
  }

  function getStatusColor(status) {
    if (status === "online") return "bg-green-500";
    if (status === "idle") return "bg-yellow-400";
    if (status === "dnd") return "bg-red-500";
    return "bg-slate-600";
  }

  const filteredMembers = members.filter((member) =>
    member.userId?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const ownerMembers = filteredMembers.filter((m) => m.role === "owner");
  const adminMembers = filteredMembers.filter((m) => m.role === "admin");
  const moderatorMembers = filteredMembers.filter((m) => m.role === "moderator");
  const onlineMembers = filteredMembers.filter(
    (m) => m.role === "member" && getStatus(m.userId?._id) !== "offline"
  );
  const offlineMembers = filteredMembers.filter(
    (m) => m.role === "member" && getStatus(m.userId?._id) === "offline"
  );

  function MemberItem({ member }) {
    const user = member.userId;
    const status = getStatus(user?._id);

    return (
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.04]">
        <div className="relative shrink-0">
          <Image
            src={user?.avatar || "/logo.png"}
            alt={user?.username || "User"}
            width={38}
            height={38}
            className={`h-[38px] w-[38px] rounded-full ${
              status === "offline" ? "opacity-45 grayscale" : ""
            }`}
          />

          <span
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0b0f1d] ${getStatusColor(
              status
            )}`}
          />
        </div>

        <div className="min-w-0">
          <p
            className={`truncate text-sm font-bold ${
              status === "offline" ? "text-slate-500" : "text-slate-200"
            }`}
          >
            {user?.username || "Unknown User"}

            {user?.isStaff && (
              <span className="ml-1 text-violet-400" title="Relayed Staff">
                ◆
              </span>
            )}

            {user?.isAdmin && (
              <span className="ml-1 text-red-400" title="Relayed Admin">
                🛡
              </span>
            )}
          </p>

          <p className="truncate text-xs text-slate-500">
            {getDisplayStatus(user?._id)}
          </p>
        </div>
      </div>
    );
  }

  function MemberGroup({ title, members }) {
    if (!members.length) return null;

    return (
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase text-slate-500">
          {title} — {members.length}
        </h3>

        <div className="space-y-1">
          {members.map((member) => (
            <MemberItem key={member._id} member={member} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-l border-white/10 bg-[#0b0f1d] xl:flex xl:flex-col">
      <div className="shrink-0 p-4">
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        <MemberGroup title="Owner" members={ownerMembers} />
        <MemberGroup title="Admin" members={adminMembers} />
        <MemberGroup title="Moderator" members={moderatorMembers} />
        <MemberGroup title="Online" members={onlineMembers} />
        <MemberGroup title="Offline" members={offlineMembers} />
      </div>
    </aside>
  );
}
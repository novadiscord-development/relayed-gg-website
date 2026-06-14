import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import UserProfilePopout from "@/components/users/UserProfilePopout";

export default function MemberSidebar() {
  const router = useRouter();
  const { serverId } = router.query;

  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [presences, setPresences] = useState({});
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (!serverId) return;

    loadMembers();
    loadPresence();

    const interval = setInterval(loadPresence, 1000);

    function refreshMembers() {
      loadMembers();
    }

    window.addEventListener("member:updated", refreshMembers);
    window.addEventListener("role:updated", refreshMembers);
    window.addEventListener("roles:updated", refreshMembers);

    return () => {
      clearInterval(interval);
      window.removeEventListener("member:updated", refreshMembers);
      window.removeEventListener("role:updated", refreshMembers);
      window.removeEventListener("roles:updated", refreshMembers);
    };
  }, [serverId]);

  async function loadMembers() {
    const res = await fetch(`/api/members/get-members?serverId=${serverId}`);
    const data = await res.json();

    if (res.ok) {
      setMembers(data.members || []);
      setCurrentMember(data.currentMember || null);
    }
  }

  async function loadPresence() {
    const res = await fetch(`/api/presence/get?serverId=${serverId}`);
    const data = await res.json();

    if (res.ok) {
      setPresences(data.presences || {});
    }
  }

  function getPresence(userId) {
    return presences?.[userId] || { status: "offline", customStatus: "" };
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
    if (presence.status === "offline") return "Offline";

    return presence.customStatus?.trim() || getStatusLabel(presence.status);
  }

  function getStatusColor(status) {
    if (status === "online") return "bg-green-500";
    if (status === "idle") return "bg-yellow-400";
    if (status === "dnd") return "bg-red-500";
    return "bg-slate-600";
  }

  function getVisibleRoles(member) {
    return (member?.roles || [])
      .filter((role) => !role.isEveryone && !role.managed)
      .sort((a, b) => (b.position || 0) - (a.position || 0));
  }

  function getHighestRole(member) {
    const roles = getVisibleRoles(member);
    if (!roles.length) return null;
    return roles[0];
  }

  function getDisplayNameColor(member) {
    return getHighestRole(member)?.color || null;
  }

  function getGroupName(member) {
    const highestRole = getHighestRole(member);

    if (highestRole) return highestRole.name;

    const status = getStatus(member.userId?._id);
    return status === "offline" ? "Offline" : "Online";
  }

  const filteredMembers = members.filter((member) =>
    member.userId?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedMembers = useMemo(() => {
    const groups = new Map();

    filteredMembers.forEach((member) => {
      const groupName = getGroupName(member);
      const highestRole = getHighestRole(member);

      if (!groups.has(groupName)) {
        groups.set(groupName, {
          name: groupName,
          color: highestRole?.color || null,
          position: highestRole?.position ?? (groupName === "Online" ? -1 : -2),
          members: [],
        });
      }

      groups.get(groupName).members.push(member);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        members: group.members.sort((a, b) => {
          const aOffline = getStatus(a.userId?._id) === "offline";
          const bOffline = getStatus(b.userId?._id) === "offline";

          if (aOffline !== bOffline) return aOffline ? 1 : -1;

          if (a.role === "owner" && b.role !== "owner") return -1;
          if (b.role === "owner" && a.role !== "owner") return 1;

          const aTop = getHighestRole(a)?.position || 0;
          const bTop = getHighestRole(b)?.position || 0;

          if (aTop !== bTop) return bTop - aTop;

          return (a.userId?.username || "").localeCompare(
            b.userId?.username || ""
          );
        }),
      }))
      .sort((a, b) => b.position - a.position);
  }, [filteredMembers, presences]);

  function MemberItem({ member }) {
    const user = member.userId;
    const status = getStatus(user?._id);
    const highestRole = getHighestRole(member);
    const nameColor = getDisplayNameColor(member);
    const visibleRoles = getVisibleRoles(member);

    return (
      <button
        type="button"
        onClick={() => setSelectedMember(member)}
        className="group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/[0.04]"
      >
        <div className="relative shrink-0">
          <Image
            src={user?.avatar || user?.image || "/logo.png"}
            alt={user?.username || "User"}
            width={38}
            height={38}
            className={`h-[38px] w-[38px] rounded-full object-cover ${
              status === "offline" ? "opacity-45 grayscale" : ""
            }`}
          />

          <span
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0b0f1d] ${getStatusColor(
              status
            )}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-bold ${
              status === "offline" ? "text-slate-500" : "text-slate-200"
            }`}
            style={nameColor && status !== "offline" ? { color: nameColor } : undefined}
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

          {visibleRoles.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {visibleRoles.slice(0, 2).map((role) => (
                <span
                  key={role._id}
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    backgroundColor: `${role.color || "#99aab5"}22`,
                    color: role.color || "#cbd5e1",
                  }}
                >
                  {role.name}
                </span>
              ))}

              {visibleRoles.length > 2 && (
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                  +{visibleRoles.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {highestRole && (
          <span
            className="hidden h-2 w-2 shrink-0 rounded-full opacity-70 group-hover:opacity-100 sm:block"
            style={{ backgroundColor: highestRole.color }}
          />
        )}
      </button>
    );
  }

  function MemberGroup({ group }) {
    if (!group.members.length) return null;

    return (
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          {group.color && (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: group.color }}
            />
          )}

          <span>
            {group.name} — {group.members.length}
          </span>
        </h3>

        <div className="space-y-1">
          {group.members.map((member) => (
            <MemberItem key={member._id} member={member} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
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
          {groupedMembers.length === 0 ? (
            <p className="text-sm text-slate-500">No members found.</p>
          ) : (
            groupedMembers.map((group) => (
              <MemberGroup key={group.name} group={group} />
            ))
          )}
        </div>
      </aside>

      {selectedMember && (
        <UserProfilePopout
          user={selectedMember.userId}
          member={selectedMember}
          currentMember={currentMember}
          serverId={serverId}
          presence={getPresence(selectedMember.userId?._id)}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}

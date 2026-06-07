import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Save,
  Settings,
  Users,
  Shield,
  Link2,
  Ban,
  Search,
  MoreVertical,
  Crown,
  UserMinus,
  ShieldBan,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: Settings },
  { id: "members", label: "Members", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "invites", label: "Invites", icon: Link2 },
  { id: "bans", label: "Bans", icon: Ban },
];

const systemRoles = ["admin", "moderator", "member"];

export default function EditServerModal({ server, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState("overview");

  const [name, setName] = useState(server?.name || "");
  const [icon, setIcon] = useState(server?.icon || "");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);
  const [openMemberMenu, setOpenMemberMenu] = useState(null);
  const [bans, setBans] = useState([]);
  const [bansLoading, setBansLoading] = useState(false);  

  useEffect(() => {
    setName(server?.name || "");
    setIcon(server?.icon || "");
    setDescription(server?.description || "");
  }, [server]);

  useEffect(() => {
    if (activeTab === "members" && server?._id) {
      loadMembers();
    }
  }, [activeTab, server?._id]);

  useEffect(() => {
  if (activeTab === "bans" && server?._id) {
    loadBans();
  }
}, [activeTab, server?._id]);

  async function loadMembers() {
    setMembersLoading(true);

    const res = await fetch(`/api/servers/get-members?serverId=${server._id}`);
    const data = await res.json();

    if (res.ok) {
      setMembers(data.members || []);
      setCurrentMember(data.currentMember || null);
    }

    setMembersLoading(false);
  }

  async function loadBans() {
  setBansLoading(true);

  const res = await fetch(
    `/api/servers/get-bans?serverId=${server._id}`
  );

  const data = await res.json();

  if (res.ok) {
    setBans(data.bans || []);
  }

  setBansLoading(false);
}

async function banMember(member) {
  const confirmed = confirm(
    `Ban ${member.userId?.username || "this member"}?`
  );

  if (!confirmed) return;

  const res = await fetch("/api/servers/ban-member", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      memberId: member._id,
    }),
  });

  if (!res.ok) return;

  setMembers((prev) =>
    prev.filter((item) => item._id !== member._id)
  );

  setOpenMemberMenu(null);
}

async function unbanMember(ban) {
  const res = await fetch("/api/servers/unban-member", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      banId: ban._id,
    }),
  });

  if (!res.ok) return;

  setBans((prev) =>
    prev.filter((item) => item._id !== ban._id)
  );
}

  async function saveServer() {
    if (!name.trim() || saving) return;

    setSaving(true);

    const res = await fetch("/api/servers/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId: server._id,
        name,
        icon,
        description,
      }),
    });

    const data = await res.json();

    setSaving(false);

    if (!res.ok) return;

    onUpdated(data.server);
  }

  async function updateMemberRole(member, role) {
    const res = await fetch("/api/servers/update-member-role", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId: server._id,
        memberId: member._id,
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) return;

    setMembers((prev) =>
      prev.map((item) => (item._id === data.member._id ? data.member : item))
    );

    setOpenMemberMenu(null);
  }

  async function kickMember(member) {
    const confirmed = confirm(
      `Kick ${member.userId?.username || "this member"} from ${server?.name}?`
    );

    if (!confirmed) return;

    const res = await fetch("/api/servers/kick-member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId: server._id,
        memberId: member._id,
      }),
    });

    if (!res.ok) return;

    setMembers((prev) => prev.filter((item) => item._id !== member._id));
    setOpenMemberMenu(null);
  }

  const filteredMembers = members.filter((member) =>
    member.userId?.username?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const canManageMembers = currentMember?.role === "owner";

  function renderContent() {
    if (activeTab === "overview") {
      return (
        <div>
          <h2 className="text-2xl font-black text-white">Server Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your server name, icon and description.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Server Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Icon URL
              </label>
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="/logo.png"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <button
              onClick={saveServer}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "members") {
      return (
        <div>
          <h2 className="text-2xl font-black text-white">
            Members{" "}
            <span className="text-slate-500">({members.length})</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage people inside this server.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2">
              <Search size={17} className="text-slate-500" />
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {membersLoading ? (
              <p className="text-sm text-slate-500">Loading members...</p>
            ) : filteredMembers.length === 0 ? (
              <p className="text-sm text-slate-500">No members found.</p>
            ) : (
              filteredMembers.map((member) => {
                const user = member.userId;
                const isOwner = member.role === "owner";
                const canManageThisMember = canManageMembers && !isOwner;

                return (
                  <div
                    key={member._id}
                    className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Image
                        src={user?.avatar || "/logo.png"}
                        alt={user?.username || "User"}
                        width={42}
                        height={42}
                        className="h-[42px] w-[42px] rounded-full"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">
                          {user?.username || "Unknown User"}

                          {user?.isStaff && (
                            <span className="ml-2 text-violet-400">◆</span>
                          )}

                          {user?.isAdmin && (
                            <span className="ml-1 text-red-400">🛡</span>
                          )}
                        </p>

                        <p className="text-xs capitalize text-slate-500">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {isOwner ? (
                      <span className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-300">
                        <Crown size={14} />
                        Owner
                      </span>
                    ) : canManageThisMember ? (
                      <button
                        onClick={() =>
                          setOpenMemberMenu(
                            openMemberMenu === member._id ? null : member._id
                          )
                        }
                        className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/[0.06]"
                      >
                        <MoreVertical size={17} />
                      </button>
                    ) : (
                      <span className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold capitalize text-slate-500">
                        {member.role}
                      </span>
                    )}

                    {openMemberMenu === member._id && (
                      <>
                        <button
                          className="fixed inset-0 z-[9998]"
                          onClick={() => setOpenMemberMenu(null)}
                        />

                        <div className="absolute right-4 top-14 z-[9999] w-52 rounded-xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
                          <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase text-slate-500">
                            Change Role
                          </p>

                          {systemRoles.map((role) => (
                            <button
                              key={role}
                              onClick={() => updateMemberRole(member, role)}
                              className={`flex w-full rounded-lg px-3 py-2 text-left text-sm capitalize ${
                                member.role === role
                                  ? "bg-violet-600 text-white"
                                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                              }`}
                            >
                              {role}
                            </button>
                          ))}

                          <div className="my-1 h-px bg-white/10" />

                          <button
                            onClick={() => kickMember(member)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                          >
                            Kick Member
                            <UserMinus size={15} />
                          </button>

                          <button
                            onClick={() => banMember(member)}
                            className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                          >
                            Ban Member
                            <ShieldBan size={15} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "roles") {
      return (
        <div>
          <h2 className="text-2xl font-black text-white">Roles</h2>
          <p className="mt-1 text-sm text-slate-500">
            Custom roles and permissions will be added here later.
          </p>

          <div className="mt-6 space-y-3">
            {["Owner", "Admin", "Moderator", "Member"].map((role) => (
              <div
                key={role}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div>
                  <p className="font-bold text-white">{role}</p>
                  <p className="text-xs text-slate-500">Default system role</p>
                </div>

                <span className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-500">
                  System
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "invites") {
      return (
        <div>
          <h2 className="text-2xl font-black text-white">Invites</h2>
          <p className="mt-1 text-sm text-slate-500">
            View and revoke active invite links.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
            Invite management will go here next.
          </div>
        </div>
      );
    }

    if (activeTab === "bans") {
      return (
        <div>
          <h2 className="text-2xl font-black text-white">Bans</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage banned users from this server.
          </p>

          <div className="mt-6 space-y-3">
            {bansLoading ? (
              <p className="text-sm text-slate-500">
                Loading bans...
              </p>
            ) : bans.length === 0 ? (
              <p className="text-sm text-slate-500">
                No banned users.
              </p>
            ) : (
              bans.map((ban) => (
                <div
                  key={ban._id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={ban.userId?.avatar || "/logo.png"}
                      alt={ban.userId?.username}
                      width={42}
                      height={42}
                      className="rounded-full"
                    />

                    <div>
                      <p className="font-bold text-white">
                        {ban.userId?.username}
                      </p>

                      <p className="text-xs text-slate-500">
                        Banned by {ban.bannedBy?.username}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => unbanMember(ban)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-green-400 hover:bg-green-500/10"
                  >
                    Unban
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050712] text-white">
      <div className="flex h-full">
        <aside className="hidden w-[260px] border-r border-white/10 bg-[#0b0f1d] p-4 md:block">
          <h1 className="mb-6 truncate px-3 text-sm font-black uppercase text-slate-500">
            {server?.name}
          </h1>

          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setOpenMemberMenu(null);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-3xl">{renderContent()}</div>
        </main>

        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:bg-white/[0.06] hover:text-white"
        >
          <X size={21} />
        </button>
      </div>
    </div>
  );
}
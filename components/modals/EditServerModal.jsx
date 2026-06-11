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
  Camera,
  Trash2,
  ArrowRightLeft,
  Clock3,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Pencil,
  Copy,
  RefreshCw,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: Settings },
  { id: "members", label: "Members", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "invites", label: "Invites", icon: Link2 },
  { id: "bans", label: "Bans", icon: Ban },
  { id: "audit", label: "Audit Logs", icon: ShieldCheck },
];


export default function EditServerModal({ server, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState("overview");

  const [name, setName] = useState(server?.name || "");
  const [icon, setIcon] = useState(server?.icon || "");
  const [banner, setBanner] = useState(server?.banner || "");
  const [description, setDescription] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);
  const [openMemberMenu, setOpenMemberMenu] = useState(null);

  const [bans, setBans] = useState([]);
  const [bansLoading, setBansLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [invites, setInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteCreating, setInviteCreating] = useState(false);

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: "",
    color: "#99aab5",
    permissions: {},
  });

  const [dialog, setDialog] = useState(null);
  const [dialogInput, setDialogInput] = useState("");

  function showAlert(message, title = "Notice") {
    return new Promise((resolve) => {
      setDialog({
        type: "alert",
        title,
        message,
        resolve,
      });
    });
  }

  function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
      setDialog({
        type: "confirm",
        title: options.title || "Confirm Action",
        message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        danger: Boolean(options.danger),
        resolve,
      });
    });
  }

  function showPrompt(message, defaultValue = "", options = {}) {
    return new Promise((resolve) => {
      setDialogInput(defaultValue);
      setDialog({
        type: "prompt",
        title: options.title || "Input Required",
        message,
        confirmText: options.confirmText || "Continue",
        cancelText: options.cancelText || "Cancel",
        placeholder: options.placeholder || "",
        danger: Boolean(options.danger),
        resolve,
      });
    });
  }

  function closeDialog(value) {
    const resolver = dialog?.resolve;
    setDialog(null);
    setDialogInput("");
    resolver?.(value);
  }

  useEffect(() => {
    setName(server?.name || "");
    setIcon(server?.icon || "");
    setBanner(server?.banner || "");
    setDescription(server?.description || "");
  }, [server]);

  useEffect(() => {
    if (!server?._id) return;
    loadMembers();
  }, [server?._id]);

  useEffect(() => {
    if (activeTab === "bans" && server?._id) loadBans();
  }, [activeTab, server?._id]);

  useEffect(() => {
    if (activeTab === "roles" && server?._id) loadRoles();
  }, [activeTab, server?._id]);

  useEffect(() => {
    if (activeTab === "invites" && server?._id) loadInvites();
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

    const res = await fetch(`/api/servers/get-bans?serverId=${server._id}`);
    const data = await res.json();

    if (res.ok) setBans(data.bans || []);
    setBansLoading(false);
  }

  async function loadInvites() {
    setInvitesLoading(true);

    try {
      const res = await fetch(`/api/invites/get?serverId=${server._id}`);
      const data = await res.json();

      if (res.ok) {
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error("LOAD_INVITES_ERROR", error);
    } finally {
      setInvitesLoading(false);
    }
  }

  async function createInvite() {
    if (inviteCreating) return;

    setInviteCreating(true);

    try {
      const res = await fetch("/api/invites/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId: server._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        await showAlert(data.message || "Failed to create invite", "Invite Error");
        return;
      }

      await loadInvites();
    } catch (error) {
      console.error("CREATE_INVITE_ERROR", error);
      await showAlert("Failed to create invite", "Invite Error");
    } finally {
      setInviteCreating(false);
    }
  }

  async function revokeInvite(invite) {
    const confirmed = await showConfirm("Revoke this invite link?", {
      title: "Revoke Invite",
      confirmText: "Revoke",
      danger: true,
    });

    if (!confirmed) return;

    const res = await fetch("/api/invites/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId: server._id,
        inviteId: invite._id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      await showAlert(data.message || "Failed to revoke invite", "Invite Error");
      return;
    }

    setInvites((prev) => prev.filter((item) => item._id !== invite._id));
  }

  async function copyInvite(invite) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const code = invite.code || invite.inviteCode || invite._id;
    const inviteUrl = `${origin}/invite/${code}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch (error) {
      console.error("COPY_INVITE_ERROR", error);
    }
  }

  async function timeoutMember(member) {
  const duration = await showPrompt(
    "Timeout duration (5m, 10m, 30m, 1h, 6h, 1d, 1w)",
    "1h",
    {
      title: "Timeout Member",
      confirmText: "Next",
      placeholder: "1h",
    }
  );

  if (!duration) return;

  const reason =
    (await showPrompt("Reason for timeout", "", {
      title: "Timeout Reason",
      confirmText: "Timeout",
      placeholder: "Optional reason",
      danger: true,
    })) || "";

  const res = await fetch("/api/servers/timeout-member", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      memberId: member._id,
      duration,
      reason,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    await showAlert(data.message || "Failed to timeout member", "Timeout Error");
    return;
  }

  setOpenMemberMenu(null);
  await showAlert(`${member.userId?.username || "Member"} has been timed out.`, "Member Timed Out");
}

async function removeTimeout(member) {
  const res = await fetch("/api/servers/remove-timeout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      memberId: member._id,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    await showAlert(data.message || "Failed to remove timeout", "Timeout Error");
    return;
  }

  setOpenMemberMenu(null);
  await showAlert(`${member.userId?.username || "Member"}'s timeout was removed.`, "Timeout Removed");
}

useEffect(() => {
  if (activeTab === "audit" && server?._id) {
    loadAuditLogs();
  }
}, [activeTab, server?._id]);

async function loadAuditLogs() {
  setAuditLoading(true);

  const res = await fetch(
    `/api/servers/audit-logs?serverId=${server._id}`
  );

  const data = await res.json();

  if (res.ok) {
    setAuditLogs(data.logs || []);
  }

  setAuditLoading(false);
}

async function loadRoles() {
  const res = await fetch(`/api/roles/get?serverId=${server._id}`);
  const data = await res.json();

  if (res.ok) {
    setRoles(data.roles || []);
  }
}

async function createRole() {
  const roleName = await showPrompt("Role name", "New Role", {
    title: "Create Role",
    confirmText: "Create",
    placeholder: "New Role",
  });

  if (!roleName?.trim()) return;

  const res = await fetch("/api/roles/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      name: roleName.trim(),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    await showAlert(data.message || "Failed to create role", "Role Error");
    return;
  }

  await loadRoles();
}

function editRole(role) {
  setSelectedRole(role);
  setRoleForm({
    name: role.name || "",
    color: role.color || "#99aab5",
    permissions: {
      ...(role.permissions || {}),
    },
  });
  setActiveTab("role-editor");
}

function updateRolePermission(permission, value) {
  setRoleForm((prev) => ({
    ...prev,
    permissions: {
      ...prev.permissions,
      [permission]: value,
    },
  }));
}

async function saveRole() {
  if (!selectedRole || roleSaving) return;

  setRoleSaving(true);

  const res = await fetch("/api/roles/update", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      roleId: selectedRole._id,
      name: roleForm.name,
      color: roleForm.color,
      permissions: roleForm.permissions,
    }),
  });

  const data = await res.json();
  setRoleSaving(false);

  if (!res.ok) {
    await showAlert(data.message || "Failed to save role", "Role Error");
    return;
  }

  setSelectedRole(data.role);
  await loadRoles();
  setActiveTab("roles");
}

async function deleteRole(role) {
  const confirmed = await showConfirm(`Delete role "${role.name}"?`, {
    title: "Delete Role",
    confirmText: "Delete",
    danger: true,
  });

  if (!confirmed) return;

  const res = await fetch("/api/roles/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      roleId: role._id,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    await showAlert(data.message || "Failed to delete role", "Role Error");
    return;
  }

  await loadRoles();
  await loadMembers();
}

async function assignRole(member, role, action) {
  const res = await fetch("/api/roles/assign", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverId: server._id,
      memberId: member._id,
      roleId: role._id,
      action,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    await showAlert(data.message || "Failed to update member role", "Role Error");
    return;
  }

  setMembers((prev) =>
    prev.map((item) => (item._id === data.member._id ? data.member : item))
  );
}

  async function uploadImage(file, type) {
    if (!file) return;

    try {
      type === "icon" ? setUploadingIcon(true) : setUploadingBanner(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Image upload failed");

      if (type === "icon") setIcon(data.url);
      if (type === "banner") setBanner(data.url);
    } catch (error) {
      console.error("SERVER_IMAGE_UPLOAD_ERROR", error);
    } finally {
      setUploadingIcon(false);
      setUploadingBanner(false);
    }
  }

  async function handleIconUpload(event) {
    await uploadImage(event.target.files?.[0], "icon");
    event.target.value = "";
  }

  async function handleBannerUpload(event) {
    await uploadImage(event.target.files?.[0], "banner");
    event.target.value = "";
  }

  async function saveServer() {
    if (!name.trim() || saving) return;

    setSaving(true);

    const res = await fetch("/api/servers/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server._id,
        name,
        icon,
        banner,
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
      headers: { "Content-Type": "application/json" },
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

  async function transferOwnership(member) {
    const username = member.userId?.username || "this member";

    const confirmed = await showConfirm(
      `Transfer ownership of ${server?.name} to ${username}? You will lose owner permissions.`,
      {
        title: "Transfer Ownership",
        confirmText: "Transfer",
        danger: true,
      }
    );

    if (!confirmed) return;

    const res = await fetch("/api/servers/transfer-ownership", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server._id,
        memberId: member._id,
      }),
    });

    const data = await res.json();
    if (!res.ok) return;

    setMembers(data.members || []);
    setCurrentMember(data.currentMember || null);
    setOpenMemberMenu(null);
    onUpdated(data.server);
  }

  async function deleteServer() {
    const typed = await showPrompt(
      `Type "${server?.name}" to permanently delete this server.`,
      "",
      {
        title: "Delete Server",
        confirmText: "Delete Server",
        placeholder: server?.name || "Server name",
        danger: true,
      }
    );

    if (typed !== server?.name) return;

    setDeleting(true);

    const res = await fetch("/api/servers/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server._id,
      }),
    });

    setDeleting(false);

    if (!res.ok) return;

    onClose?.();
    window.location.href = "/app";
  }

  async function kickMember(member) {
    const confirmed = await showConfirm(
      `Kick ${member.userId?.username || "this member"} from ${server?.name}?`,
      {
        title: "Kick Member",
        confirmText: "Kick",
        danger: true,
      }
    );

    if (!confirmed) return;

    const res = await fetch("/api/servers/kick-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server._id,
        memberId: member._id,
      }),
    });

    if (!res.ok) return;

    setMembers((prev) => prev.filter((item) => item._id !== member._id));
    setOpenMemberMenu(null);
  }

  async function banMember(member) {
    const confirmed = await showConfirm(
      `Ban ${member.userId?.username || "this member"}?`,
      {
        title: "Ban Member",
        confirmText: "Ban",
        danger: true,
      }
    );
    if (!confirmed) return;

    const res = await fetch("/api/servers/ban-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server._id,
        memberId: member._id,
      }),
    });

    if (!res.ok) return;

    setMembers((prev) => prev.filter((item) => item._id !== member._id));
    setOpenMemberMenu(null);
  }

  async function unbanMember(ban) {
    const res = await fetch("/api/servers/unban-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server._id,
        banId: ban._id,
      }),
    });

    if (!res.ok) return;
    setBans((prev) => prev.filter((item) => item._id !== ban._id));
  }

  const filteredMembers = members.filter((member) =>
    member.userId?.username?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  function getRolePermissions(member) {
    const permissions = {};

    member?.roles?.forEach((role) => {
      Object.entries(role.permissions || {}).forEach(([key, value]) => {
        if (value === true) permissions[key] = true;
      });
    });

    return permissions;
  }

  function memberHasPermission(member, permission) {
    if (!member) return false;
    if (member.role === "owner") return true;

    const permissions = getRolePermissions(member);
    return Boolean(permissions[permission]);
  }

  const currentPermissions = getRolePermissions(currentMember);
  const isOwner = currentMember?.role === "owner";

  const canManageServer = isOwner || Boolean(currentPermissions.manageServer);
  const canManageRoles = isOwner || Boolean(currentPermissions.manageRoles);
  const canKickMembers = isOwner || Boolean(currentPermissions.kickMembers);
  const canBanMembers = isOwner || Boolean(currentPermissions.banMembers);
  const canTimeoutMembers =
    isOwner || Boolean(currentPermissions.timeoutMembers);

  const canManageMembers =
    isOwner ||
    canManageRoles ||
    canKickMembers ||
    canBanMembers ||
    canTimeoutMembers;

  function canManageTargetMember(targetMember, permission) {
    if (!currentMember || !targetMember) return false;
    if (currentMember._id === targetMember._id) return false;
    if (targetMember.role === "owner") return false;
    if (isOwner) return true;

    return memberHasPermission(currentMember, permission);
  }

  function getInitials(value) {
    return value
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function getInviteUrl(invite) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const code = invite.code || invite.inviteCode || invite._id;

    return `${origin}/invite/${code}`;
  }

  function formatInviteUses(invite) {
    const uses = invite.uses || 0;

    if (!invite.maxUses) {
      return `${uses} use${uses === 1 ? "" : "s"}`;
    }

    return `${uses}/${invite.maxUses} uses`;
  }

  function formatInviteExpiry(invite) {
    if (!invite.expiresAt) return "Never expires";

    const expiresAt = new Date(invite.expiresAt);

    if (Number.isNaN(expiresAt.getTime())) return "Never expires";
    if (expiresAt <= new Date()) return "Expired";

    return `Expires ${expiresAt.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  function renderContent() {
    if (activeTab === "overview") {
      if (!canManageServer) {
        return (
          <div>
            <h2 className="text-xl font-black text-white">Server Overview</h2>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-slate-300">
                You need the Manage Server permission to edit this server.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div>
          <h2 className="text-xl font-black text-white">Server Overview</h2>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div
              className="relative h-44 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500"
              style={
                banner
                  ? {
                      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(11,15,29,0.45)), url(${banner})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#111214]/70" />

              <label
                htmlFor="server-banner-upload"
                className="absolute right-4 top-4 flex cursor-pointer items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-black/70"
              >
                <Camera size={15} />
                {uploadingBanner ? "Uploading..." : "Upload Banner"}
              </label>
            </div>

            <input
              id="server-banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />

            <div className="p-5">
              {banner && (
                <button
                  type="button"
                  onClick={() => setBanner("")}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Remove banner
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 border-b border-white/10 pb-8">
            <div className="grid gap-8 md:grid-cols-[180px_1fr]">
              <div>
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-3xl font-black text-white">
                  {icon ? (
                    <Image
                      src={icon}
                      alt={name || "Server"}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(name || server?.name || "S")
                  )}

                  <label
                    htmlFor="server-icon-upload"
                    className="absolute right-1 top-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#313338] bg-[#5865f2] text-white shadow-lg hover:bg-[#4752c4]"
                  >
                    <Camera size={15} />
                  </label>
                </div>

                <input
                  id="server-icon-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconUpload}
                />

                <label
                  htmlFor="server-icon-upload"
                  className="mx-auto mt-4 flex cursor-pointer items-center justify-center rounded-md border border-white/10 bg-[#2b2d31] px-4 py-2 text-xs font-bold text-white hover:bg-[#35373c]"
                >
                  {uploadingIcon ? "Uploading..." : "Upload Image"}
                </label>

                {icon && (
                  <button
                    type="button"
                    onClick={() => setIcon("")}
                    className="mx-auto mt-3 block text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  We recommend an image of at least 512x512 for the icon and
                  960x540 for the banner.
                </p>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-black uppercase text-slate-400">
                    Server Name
                  </label>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    className="w-full rounded bg-[#1e1f22] px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-7">
            <label className="mb-2 block text-xs font-black uppercase text-slate-400">
              Server Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Describe your server"
              className="w-full resize-none rounded bg-[#1e1f22] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500"
            />

            <div className="mt-2 text-right text-xs text-slate-600">
              {description.length}/500
            </div>
          </div>

          {isOwner && (
            <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-red-300">
                Danger Zone
              </h3>

              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-black/20 p-4">
                <div>
                  <p className="font-bold text-white">Delete Server</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Permanently delete this server and all related data.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={deleteServer}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={saveServer}
              disabled={
                saving ||
                !name.trim() ||
                uploadingIcon ||
                uploadingBanner
              }
              className="flex items-center gap-2 rounded bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50"
            >
              <Save size={16} />
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
            Members <span className="text-slate-500">({members.length})</span>
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
                const memberIsOwner = member.role === "owner";
                const canManageThisMember =
                  canManageMembers &&
                  currentMember?._id !== member._id &&
                  !memberIsOwner;

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

                        {member.roles?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {member.roles.map((role) => (
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
                          </div>
                        )}
                      </div>
                    </div>

                    {memberIsOwner ? (
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

                        <div className="absolute right-4 top-14 z-[9999] w-56 rounded-xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
                          {canManageRoles && roles.length > 0 && (
                            <>
                              <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase text-slate-500">
                                Custom Roles
                              </p>

                              {roles.map((role) => {
                                const hasRole = member.roles?.some(
                                  (memberRole) => memberRole._id === role._id
                                );

                                return (
                                  <button
                                    key={role._id}
                                    onClick={() =>
                                      assignRole(
                                        member,
                                        role,
                                        hasRole ? "remove" : "add"
                                      )
                                    }
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                                      hasRole
                                        ? "bg-white/[0.06] text-white"
                                        : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                                    }`}
                                  >
                                    <span className="flex min-w-0 items-center gap-2">
                                      <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: role.color }}
                                      />
                                      <span className="truncate">{role.name}</span>
                                    </span>

                                    <span className="text-xs text-slate-500">
                                      {hasRole ? "Remove" : "Add"}
                                    </span>
                                  </button>
                                );
                              })}

                              <div className="my-1 h-px bg-white/10" />
                            </>
                          )}

                          {isOwner && (
                            <button
                              onClick={() => transferOwnership(member)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-yellow-500/10"
                            >
                              Transfer Ownership
                              <ArrowRightLeft size={15} />
                            </button>
                          )}

                          {canManageTargetMember(member, "kickMembers") && (
                            <button
                              onClick={() => kickMember(member)}
                              className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                            >
                              Kick Member
                              <UserMinus size={15} />
                            </button>
                          )}

                          {canManageTargetMember(member, "banMembers") && (
                            <button
                              onClick={() => banMember(member)}
                              className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                            >
                              Ban Member
                              <ShieldBan size={15} />
                            </button>
                          )}

                          {canManageTargetMember(member, "timeoutMembers") && (
                            <>
                              <button
                                onClick={() => timeoutMember(member)}
                                className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/10"
                              >
                                Timeout Member
                                <Clock3 size={15} />
                              </button>

                              <button
                                onClick={() => removeTimeout(member)}
                                className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-green-400 hover:bg-green-500/10"
                              >
                                Remove Timeout
                                <ShieldCheck size={15} />
                              </button>
                            </>
                          )}
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
      if (!canManageRoles) {
        return (
          <div>
            <h2 className="text-2xl font-black text-white">Roles</h2>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-slate-300">
                You need the Manage Roles permission to edit roles.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Roles</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage custom roles, colors, and permissions.
              </p>
            </div>

            <button
              type="button"
              onClick={createRole}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
            >
              <Plus size={16} />
              Create Role
            </button>
          </div>

          <div className="mt-6 space-y-3">

            {roles.map((role) => (
              <div
                key={role._id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-white/10"
                      style={{ backgroundColor: role.color || "#99aab5" }}
                    />

                    <div className="min-w-0">
                      <p
                        className="truncate font-bold"
                        style={{ color: role.color || "#ffffff" }}
                      >
                        {role.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        Position #{role.position}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editRole(role)}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRole(role)}
                      className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(role.permissions || {})
                    .filter(([, value]) => value)
                    .map(([permission]) => (
                      <span
                        key={permission}
                        className="rounded-lg bg-violet-500/10 px-2 py-1 text-[11px] font-bold text-violet-300"
                      >
                        {permission}
                      </span>
                    ))}

                  {Object.values(role.permissions || {}).filter(Boolean).length ===
                    0 && (
                    <span className="text-xs text-slate-600">
                      No extra permissions enabled.
                    </span>
                  )}
                </div>
              </div>
            ))}

            {roles.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-sm text-slate-500">
                  No custom roles created yet.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "role-editor") {
      if (!canManageRoles) {
        return (
          <div>
            <h2 className="text-2xl font-black text-white">Edit Role</h2>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-slate-300">
                You need the Manage Roles permission to edit roles.
              </p>
            </div>
          </div>
        );
      }

      const permissions = [
        ["manageServer", "Manage Server"],
        ["manageChannels", "Manage Channels"],
        ["manageRoles", "Manage Roles"],
        ["kickMembers", "Kick Members"],
        ["banMembers", "Ban Members"],
        ["timeoutMembers", "Timeout Members"],
        ["manageMessages", "Manage Messages"],
        ["mentionEveryone", "Mention Everyone"],
        ["sendMessages", "Send Messages"],
        ["attachFiles", "Attach Files"],
        ["viewChannels", "View Channels"],
      ];

      return (
        <div>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className="mb-5 text-sm font-bold text-slate-400 hover:text-white"
          >
            ← Back to Roles
          </button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                Edit Role
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the role name, color, and permissions.
              </p>
            </div>

            <button
              type="button"
              onClick={saveRole}
              disabled={roleSaving}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              <Save size={16} />
              {roleSaving ? "Saving..." : "Save Role"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <label className="mb-2 block text-xs font-black uppercase text-slate-400">
              Role Name
            </label>

            <input
              value={roleForm.name}
              onChange={(e) =>
                setRoleForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              maxLength={40}
              className="w-full rounded bg-[#1e1f22] px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500"
            />

            <label className="mb-2 mt-5 block text-xs font-black uppercase text-slate-400">
              Role Color
            </label>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={roleForm.color}
                onChange={(e) =>
                  setRoleForm((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                className="h-11 w-16 cursor-pointer rounded border border-white/10 bg-[#1e1f22]"
              />

              <input
                value={roleForm.color}
                onChange={(e) =>
                  setRoleForm((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                className="w-32 rounded bg-[#1e1f22] px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500"
              />

              <span
                className="rounded-lg px-3 py-2 text-sm font-bold"
                style={{
                  backgroundColor: `${roleForm.color}22`,
                  color: roleForm.color,
                }}
              >
                Preview
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
              Permissions
            </h3>

            <div className="mt-4 divide-y divide-white/10">
              {permissions.map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-bold text-white">{label}</p>
                    <p className="text-xs text-slate-500">
                      {key}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateRolePermission(
                        key,
                        !Boolean(roleForm.permissions?.[key])
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      roleForm.permissions?.[key]
                        ? "bg-violet-600"
                        : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        roleForm.permissions?.[key] ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "invites") {
      return (
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Invites</h2>
              <p className="mt-1 text-sm text-slate-500">
                Create, copy, and revoke active invite links.
              </p>
            </div>

            {canManageServer && (
              <button
                type="button"
                onClick={createInvite}
                disabled={inviteCreating}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
              >
                <Plus size={16} />
                {inviteCreating ? "Creating..." : "Create Invite"}
              </button>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Active Invites
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Anyone with an active invite link can join this server.
                </p>
              </div>

              <button
                type="button"
                onClick={loadInvites}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {invitesLoading ? (
                <p className="text-sm text-slate-500">Loading invites...</p>
              ) : invites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No active invites yet.
                  </p>
                </div>
              ) : (
                invites.map((invite) => (
                  <div
                    key={invite._id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-mono text-sm font-bold text-white">
                            {getInviteUrl(invite)}
                          </p>

                          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-slate-400">
                            {invite.code || invite.inviteCode || invite._id}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>{formatInviteUses(invite)}</span>
                          <span>{formatInviteExpiry(invite)}</span>
                          {invite.createdBy?.username && (
                            <span>Created by {invite.createdBy.username}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyInvite(invite)}
                          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          <Copy size={14} />
                          Copy
                        </button>

                        {canManageServer && (
                          <button
                            type="button"
                            onClick={() => revokeInvite(invite)}
                            className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "audit") {
      return (
        <div>
          <div className="flex items-start justify-between gap-6">
            <h2 className="text-2xl font-black text-white">Audit Log</h2>

            <div className="flex gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Filter by User
                </label>
                <select className="w-56 rounded-lg border border-white/10 bg-[#2b2d35] px-4 py-3 text-white outline-none">
                  <option>All Users</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Filter by Action
                </label>
                <select className="w-56 rounded-lg border border-white/10 bg-[#2b2d35] px-4 py-3 text-white outline-none">
                  <option>All Actions</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            {auditLoading ? (
              <p className="text-sm text-slate-500">Loading audit logs...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No audit logs found.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => {
                  const actor = log.actorId;
                  const target = log.targetUserId;
                  const actorName = actor?.username || "Unknown User";
                  const targetName = target?.username;
                  const action = log.action.replaceAll("_", " ").toLowerCase();

                  return (
                    <div
                      key={log._id}
                      className="rounded-xl border border-white/5 bg-[#2f313a] transition hover:bg-[#363844]"
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        <img
                          src={actor?.avatar}
                          alt={actorName}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-white">
                            <span>{actorName}</span>{" "}
                            <span className="font-normal text-slate-200">
                              {action}
                            </span>{" "}
                            {targetName && <span>{targetName}</span>}
                          </p>

                          <p className="mt-0.5 text-sm text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {log.reason && (
                        <div className="border-t border-white/5 px-16 pb-4 pt-2">
                          <p className="text-sm text-slate-400">
                            <span className="font-bold text-slate-300">
                              Reason:
                            </span>{" "}
                            {log.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
              <p className="text-sm text-slate-500">Loading bans...</p>
            ) : bans.length === 0 ? (
              <p className="text-sm text-slate-500">No banned users.</p>
            ) : (
              bans.map((ban) => (
                <div
                  key={ban._id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={ban.userId?.avatar || "/logo.png"}
                      alt={ban.userId?.username || "Banned User"}
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
          <div className="mx-auto max-w-5xl">{renderContent()}</div>
        </main>

        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:bg-white/[0.06] hover:text-white"
        >
          <X size={21} />
        </button>

        {dialog && (
          <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-5 text-white shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {dialog.title}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {dialog.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    closeDialog(dialog.type === "confirm" ? false : null)
                  }
                  className="rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {dialog.type === "prompt" && (
                <input
                  value={dialogInput}
                  onChange={(event) => setDialogInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") closeDialog(dialogInput);
                    if (event.key === "Escape") closeDialog(null);
                  }}
                  autoFocus
                  placeholder={dialog.placeholder}
                  className="mt-5 w-full rounded-lg border border-white/10 bg-[#1e1f22] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500"
                />
              )}

              <div className="mt-6 flex justify-end gap-3">
                {dialog.type !== "alert" && (
                  <button
                    type="button"
                    onClick={() => closeDialog(null)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {dialog.cancelText || "Cancel"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    closeDialog(
                      dialog.type === "prompt"
                        ? dialogInput
                        : dialog.type === "confirm"
                        ? true
                        : true
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition ${
                    dialog.danger
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-violet-600 hover:bg-violet-500"
                  }`}
                >
                  {dialog.confirmText ||
                    (dialog.type === "alert" ? "OK" : "Confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
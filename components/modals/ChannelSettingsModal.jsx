import { useEffect, useMemo, useState } from "react";
import { X, Save, Hash, Volume2, Folder, Shield, Plus, Search } from "lucide-react";

const PERMISSIONS = [
  {
    key: "viewChannels",
    label: "View Channel",
    description: "Allows this role to see this channel in the sidebar.",
  },
  {
    key: "sendMessages",
    label: "Send Messages",
    description: "Allows sending normal messages in this text channel.",
  },
  {
    key: "attachFiles",
    label: "Attach Files",
    description: "Allows uploading images and attachments in this channel.",
  },
  {
    key: "manageMessages",
    label: "Manage Messages",
    description: "Allows deleting, pinning, and managing messages here.",
  },
];

function getChannelIcon(type) {
  if (type === "voice") return Volume2;
  if (type === "category") return Folder;
  return Hash;
}

function normalizeId(value) {
  return value?._id?.toString?.() || value?.toString?.() || "";
}

function buildOverwriteKey(overwrite) {
  if (overwrite.targetType === "everyone") return "everyone";
  return `${overwrite.targetType}:${normalizeId(overwrite.targetId)}`;
}

function getState(overwrite, permission) {
  if (overwrite?.allow?.[permission]) return "allow";
  if (overwrite?.deny?.[permission]) return "deny";
  return "neutral";
}

function setPermissionState(overwrite, permission, state) {
  const next = {
    ...overwrite,
    allow: { ...(overwrite?.allow || {}) },
    deny: { ...(overwrite?.deny || {}) },
  };

  delete next.allow[permission];
  delete next.deny[permission];

  if (state === "allow") next.allow[permission] = true;
  if (state === "deny") next.deny[permission] = true;

  return next;
}

export default function ChannelSettingsModal({ channel, serverId, onClose, onUpdated }) {
  const ChannelIcon = getChannelIcon(channel?.type);

  const [activeTab, setActiveTab] = useState("overview");
  const [name, setName] = useState(channel?.name || "");
  const [roles, setRoles] = useState([]);
  const [overwrites, setOverwrites] = useState([]);
  const [selectedKey, setSelectedKey] = useState("everyone");
  const [roleSearch, setRoleSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(channel?.name || "");
    setSelectedKey("everyone");
  }, [channel?._id]);

  useEffect(() => {
    if (!channel?._id || !serverId) return;
    loadSettings();
  }, [channel?._id, serverId]);

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch(`/api/roles/get?serverId=${serverId}`),
        fetch(`/api/channel-permissions/get?channelId=${channel._id}`),
      ]);

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      if (rolesRes.ok) setRoles(rolesData.roles || []);

      if (permsRes.ok) {
        const loaded = permsData.overwrites || permsData.permissions || [];
        setOverwrites(loaded.length ? loaded : [createEveryoneOverwrite()]);
      } else {
        setOverwrites([createEveryoneOverwrite()]);
      }
    } catch (err) {
      console.error("LOAD_CHANNEL_SETTINGS_ERROR", err);
      setError("Failed to load channel permissions.");
      setOverwrites([createEveryoneOverwrite()]);
    } finally {
      setLoading(false);
    }
  }

  function createEveryoneOverwrite() {
    return {
      targetType: "everyone",
      targetId: null,
      allow: {},
      deny: {},
    };
  }

  const visibleRoles = useMemo(
    () => roles.filter((role) => !role.isEveryone && !role.managed),
    [roles]
  );

  const everyoneRole = useMemo(
    () => roles.find((role) => role.isEveryone) || { name: "@everyone", color: "#99aab5" },
    [roles]
  );

  const overwriteList = useMemo(() => {
    const map = new Map();

    overwrites.forEach((overwrite) => {
      map.set(buildOverwriteKey(overwrite), overwrite);
    });

    if (!map.has("everyone")) {
      map.set("everyone", createEveryoneOverwrite());
    }

    return Array.from(map.values());
  }, [overwrites]);

  const selectedOverwrite = useMemo(() => {
    return overwriteList.find((overwrite) => buildOverwriteKey(overwrite) === selectedKey) || overwriteList[0];
  }, [overwriteList, selectedKey]);

  const assignableRoles = visibleRoles.filter((role) => {
    const key = `role:${role._id}`;
    const exists = overwriteList.some((overwrite) => buildOverwriteKey(overwrite) === key);
    const matches = role.name.toLowerCase().includes(roleSearch.toLowerCase());
    return !exists && matches;
  });

  function getOverwriteLabel(overwrite) {
    if (overwrite.targetType === "everyone") return "@everyone";

    const roleId = normalizeId(overwrite.targetId);
    const role = visibleRoles.find((item) => item._id === roleId);

    return role?.name || "Deleted Role";
  }

  function getOverwriteColor(overwrite) {
    if (overwrite.targetType === "everyone") return everyoneRole.color || "#99aab5";

    const roleId = normalizeId(overwrite.targetId);
    const role = visibleRoles.find((item) => item._id === roleId);

    return role?.color || "#99aab5";
  }

  function addRoleOverwrite(role) {
    const next = {
      targetType: "role",
      targetId: role._id,
      allow: {},
      deny: {},
    };

    setOverwrites((prev) => [...prev, next]);
    setSelectedKey(`role:${role._id}`);
    setRoleSearch("");
  }

  function removeOverwrite(overwrite) {
    if (overwrite.targetType === "everyone") return;

    const key = buildOverwriteKey(overwrite);
    setOverwrites((prev) => prev.filter((item) => buildOverwriteKey(item) !== key));
    setSelectedKey("everyone");
  }

  function updateSelectedPermission(permission, state) {
    setOverwrites((prev) => {
      const key = selectedKey;
      const exists = prev.some((overwrite) => buildOverwriteKey(overwrite) === key);
      const base = exists ? prev : [...prev, createEveryoneOverwrite()];

      return base.map((overwrite) => {
        if (buildOverwriteKey(overwrite) !== key) return overwrite;
        return setPermissionState(overwrite, permission, state);
      });
    });
  }

  async function saveOverview() {
    if (!name.trim() || saving) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/channels/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: channel._id,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update channel.");
        return;
      }

      onUpdated?.(data.channel);
      onClose?.();
    } catch (err) {
      console.error("SAVE_CHANNEL_OVERVIEW_ERROR", err);
      setError("Failed to update channel.");
    } finally {
      setSaving(false);
    }
  }

  async function savePermissions() {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/channel-permissions/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: channel._id,
          overwrites: overwriteList,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update permissions.");
        return;
      }

      setOverwrites(data.overwrites || data.permissions || overwriteList);
      onUpdated?.(data.channel || channel);
      window.dispatchEvent(new Event("channel:updated"));
    } catch (err) {
      console.error("SAVE_CHANNEL_PERMISSIONS_ERROR", err);
      setError("Failed to update permissions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex bg-[#050712] text-white">
      <aside className="hidden w-[260px] shrink-0 border-r border-white/10 bg-[#0b0f1d] p-4 md:block">
        <div className="mb-6 px-3">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-500">
            <ChannelIcon size={15} />
            Channel Settings
          </div>
          <p className="mt-2 truncate text-lg font-black text-white">{channel?.name}</p>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-bold transition ${
              activeTab === "overview" ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("permissions")}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-bold transition ${
              activeTab === "permissions" ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            Permissions
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 grid grid-cols-2 gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                activeTab === "overview"
                  ? "bg-violet-600 text-white"
                  : "bg-white/[0.04] text-slate-400"
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("permissions")}
              className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                activeTab === "permissions"
                  ? "bg-violet-600 text-white"
                  : "bg-white/[0.04] text-slate-400"
              }`}
            >
              Permissions
            </button>
          </div>
          <div className="mb-6 flex items-start justify-between gap-4 md:mb-8">
            <div>
              <h2 className="text-xl font-black text-white md:text-2xl">
                {activeTab === "overview" ? "Channel Overview" : "Channel Permissions"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeTab === "overview"
                  ? "Update this channel's name."
                  : "Control who can see and use this channel."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <label className="mb-2 block text-xs font-black uppercase text-slate-400">
                Channel Name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
                className="w-full rounded bg-[#1e1f22] px-3 py-2.5 text-[16px] text-white outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm"
              />

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={saveOverview}
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                  Roles / Members
                </h3>

                <div className="space-y-1">
                  {overwriteList.map((overwrite) => {
                    const key = buildOverwriteKey(overwrite);
                    const active = selectedKey === key;
                    const color = getOverwriteColor(overwrite);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedKey(key)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition ${
                          active ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate">{getOverwriteLabel(overwrite)}</span>
                        </span>

                        {overwrite.targetType !== "everyone" && (
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              removeOverwrite(overwrite);
                            }}
                            className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <X size={13} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                    <Plus size={13} />
                    Add Role
                  </label>

                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <Search size={14} className="text-slate-500" />
                    <input
                      value={roleSearch}
                      onChange={(event) => setRoleSearch(event.target.value)}
                      placeholder="Search roles"
                      className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                    />
                  </div>

                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {assignableRoles.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-500">
                        No roles available.
                      </p>
                    ) : (
                      assignableRoles.map((role) => (
                        <button
                          key={role._id}
                          type="button"
                          onClick={() => addRoleOverwrite(role)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: role.color || "#99aab5" }}
                          />
                          <span className="truncate">{role.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading permissions...</p>
                ) : (
                  <>
                    <div className="mb-5 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"
                        style={{ color: getOverwriteColor(selectedOverwrite) }}
                      >
                        <Shield size={18} />
                      </div>

                      <div>
                        <h3 className="font-black text-white">
                          {getOverwriteLabel(selectedOverwrite)}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Choose allow, neutral, or deny for this channel.
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-white/10">
                      {PERMISSIONS.map((permission) => {
                        const state = getState(selectedOverwrite, permission.key);

                        return (
                          <div key={permission.key} className="py-5">
                            <div className="mb-3 flex items-start justify-between gap-4">
                              <div>
                                <p className="font-bold text-white">{permission.label}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {permission.description}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 rounded-xl bg-black/20 p-1">
                              <button
                                type="button"
                                onClick={() => updateSelectedPermission(permission.key, "deny")}
                                className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                                  state === "deny"
                                    ? "bg-red-600 text-white"
                                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                Deny
                              </button>

                              <button
                                type="button"
                                onClick={() => updateSelectedPermission(permission.key, "neutral")}
                                className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                                  state === "neutral"
                                    ? "bg-slate-600 text-white"
                                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                Neutral
                              </button>

                              <button
                                type="button"
                                onClick={() => updateSelectedPermission(permission.key, "allow")}
                                className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                                  state === "allow"
                                    ? "bg-green-600 text-white"
                                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                Allow
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={savePermissions}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white transition hover:bg-violet-500 disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Permissions"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

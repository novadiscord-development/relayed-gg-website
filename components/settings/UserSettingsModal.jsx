import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bell,
  Lock,
  User,
  UserCircle,
  Shield,
  X,
  Save,
  Upload,
} from "lucide-react";

const tabs = [
  { id: "account", label: "My Account", icon: UserCircle },
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Safety", icon: Lock },
  { id: "blocked", label: "Blocked Users", icon: Shield },
];

export default function UserSettingsModal({ open, onClose }) {
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    username: "",
    avatar: "",
    banner: "",
    bio: "",
    pronouns: "",
    customStatus: "",
    settings: {
      dmNotifications: true,
      mentionNotifications: true,
      friendRequestNotifications: true,
      soundEffects: true,
      allowFriendRequests: "everyone",
      allowDMs: true,
      showPresence: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    loadMe();
  }, [open]);

  if (!open) return null;

  async function loadMe() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/users/me");
      const data = await res.json();

      if (!res.ok) return;

      setUser(data.user);

      setForm({
        username: data.user.username || "",
        avatar: data.user.avatar || "",
        banner: data.user.banner || "",
        bio: data.user.bio || "",
        pronouns: data.user.pronouns || "",
        customStatus: data.user.customStatus || "",
        settings: {
          dmNotifications: data.user.settings?.dmNotifications ?? true,
          mentionNotifications: data.user.settings?.mentionNotifications ?? true,
          friendRequestNotifications:
            data.user.settings?.friendRequestNotifications ?? true,
          soundEffects: data.user.settings?.soundEffects ?? true,
          allowFriendRequests:
            data.user.settings?.allowFriendRequests || "everyone",
          allowDMs: data.user.settings?.allowDMs ?? true,
          showPresence: data.user.settings?.showPresence ?? true,
        },
      });
    } catch (error) {
      console.error("LOAD_USER_SETTINGS_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSetting(key, value) {
    setForm((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  }

  async function uploadImage(file, field) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Image must be under 8MB");
      return;
    }

    try {
      field === "avatar" ? setUploadingAvatar(true) : setUploadingBanner(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/chat-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Image upload failed");
        return;
      }

      updateField(field, data.attachment?.url || data.url || "");
      setMessage(`${field === "avatar" ? "Avatar" : "Banner"} uploaded`);
    } catch (error) {
      console.error("UPLOAD_USER_IMAGE_ERROR", error);
      setMessage("Image upload failed");
    } finally {
      setUploadingAvatar(false);
      setUploadingBanner(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/users/update-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Could not save settings");
        return;
      }

      setUser(data.user);
      setMessage("Settings saved");
    } catch (error) {
      console.error("SAVE_USER_SETTINGS_ERROR", error);
      setMessage("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ checked, onChange }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-violet-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex bg-black/70 text-white backdrop-blur-sm">
      <aside className="w-72 shrink-0 border-r border-white/10 bg-[#111214] p-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-black">User Settings</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto bg-[#1e1f22]">
        <div className="mx-auto max-w-3xl px-8 py-8">
          {loading ? (
            <p className="text-sm text-slate-400">Loading settings...</p>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h1>
                  {message && <p className="mt-2 text-sm text-violet-300">{message}</p>}
                </div>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving || uploadingAvatar || uploadingBanner}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              {activeTab === "account" && (
                <div className="rounded-2xl border border-[#2b2d31] bg-[#111214] p-5">
                  <h2 className="mb-4 text-sm font-black uppercase text-slate-500">
                    Account
                  </h2>

                  <div className="flex items-center gap-4">
                    <Image
                      src={form.avatar || "/logo.png"}
                      alt={form.username || "User"}
                      width={72}
                      height={72}
                      className="h-[72px] w-[72px] rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <p className="font-black">{user?.email}</p>
                      <p className="text-sm text-slate-500">
                        Account email cannot be changed here yet.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadImage(e.target.files?.[0], "avatar")}
                  />

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="mt-4 flex items-center gap-2 rounded-xl border border-[#2b2d31] bg-[#1e1f22] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-[#2b2d31] hover:text-white disabled:opacity-60"
                  >
                    <Upload size={16} />
                    {uploadingAvatar ? "Uploading avatar..." : "Upload Avatar"}
                  </button>

                  <label className="mt-5 block">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Username
                    </span>
                    <input
                      value={form.username}
                      onChange={(e) => updateField("username", e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#2b2d31] bg-[#1e1f22] px-4 py-3 text-sm outline-none focus:border-violet-500"
                    />
                  </label>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="overflow-hidden rounded-2xl border border-[#2b2d31] bg-[#111214]">
                  <div
                    className="h-36 bg-gradient-to-br from-violet-600 to-blue-600"
                    style={
                      form.banner
                        ? {
                            backgroundImage: `url(${form.banner})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />

                  <div className="p-5">
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadImage(e.target.files?.[0], "banner")}
                    />

                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={uploadingBanner}
                      className="flex items-center gap-2 rounded-xl border border-[#2b2d31] bg-[#1e1f22] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-[#2b2d31] hover:text-white disabled:opacity-60"
                    >
                      <Upload size={16} />
                      {uploadingBanner ? "Uploading banner..." : "Upload Banner"}
                    </button>

                    <label className="mt-4 block">
                      <span className="text-xs font-bold uppercase text-slate-500">
                        Pronouns
                      </span>
                      <input
                        value={form.pronouns}
                        onChange={(e) => updateField("pronouns", e.target.value)}
                        placeholder="e.g. he/him"
                        className="mt-2 w-full rounded-xl border border-[#2b2d31] bg-[#1e1f22] px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                    </label>

                    <label className="mt-4 block">
                      <span className="text-xs font-bold uppercase text-slate-500">
                        Custom Status
                      </span>
                      <input
                        value={form.customStatus}
                        onChange={(e) => updateField("customStatus", e.target.value)}
                        placeholder="Working on Relayed"
                        className="mt-2 w-full rounded-xl border border-[#2b2d31] bg-[#1e1f22] px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                    </label>

                    <label className="mt-4 block">
                      <span className="text-xs font-bold uppercase text-slate-500">
                        About Me
                      </span>
                      <textarea
                        value={form.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                        maxLength={500}
                        rows={5}
                        className="mt-2 w-full resize-none rounded-xl border border-[#2b2d31] bg-[#1e1f22] px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                      <p className="mt-1 text-right text-xs text-slate-600">
                        {form.bio.length}/500
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="rounded-2xl border border-[#2b2d31] bg-[#111214] p-5">
                  <h2 className="mb-4 text-sm font-black uppercase text-slate-500">
                    Notification Preferences
                  </h2>

                  {[
                    ["dmNotifications", "Direct message notifications"],
                    ["mentionNotifications", "Mention notifications"],
                    ["friendRequestNotifications", "Friend request notifications"],
                    ["soundEffects", "Sound effects"],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between border-b border-[#2b2d31] py-4 last:border-b-0">
                      <p className="font-bold">{label}</p>
                      <Toggle
                        checked={form.settings[key]}
                        onChange={(value) => updateSetting(key, value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="rounded-2xl border border-[#2b2d31] bg-[#111214] p-5">
                  <h2 className="mb-4 text-sm font-black uppercase text-slate-500">
                    Privacy & Safety
                  </h2>

                  <label className="block">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Who can send friend requests?
                    </span>
                    <select
                      value={form.settings.allowFriendRequests}
                      onChange={(e) =>
                        updateSetting("allowFriendRequests", e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#2b2d31] bg-[#1e1f22] px-4 py-3 text-sm outline-none focus:border-violet-500"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="mutual_servers">Mutual servers only</option>
                      <option value="none">No one</option>
                    </select>
                  </label>

                  <div className="mt-5 flex items-center justify-between border-t border-[#2b2d31] pt-5">
                    <p className="font-bold">Allow DMs</p>
                    <Toggle
                      checked={form.settings.allowDMs}
                      onChange={(value) => updateSetting("allowDMs", value)}
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#2b2d31] pt-5">
                    <p className="font-bold">Show presence</p>
                    <Toggle
                      checked={form.settings.showPresence}
                      onChange={(value) => updateSetting("showPresence", value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "blocked" && (
                <div className="rounded-2xl border border-[#2b2d31] bg-[#111214] p-5">
                  <h2 className="mb-2 text-sm font-black uppercase text-slate-500">
                    Blocked Users
                  </h2>
                  <p className="text-sm text-slate-400">
                    Blocked user management will connect here next.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
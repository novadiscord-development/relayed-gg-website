import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import InvitePeopleModal from "../modals/InvitePeopleModal";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  Hash,
  Plus,
  Volume2,
  X,
  FolderPlus,
  UserPlus,
  Settings,
  LogOut,
} from "lucide-react";

import UserPanel from "./UserPanel";
import CreateChannelModal from "@/components/modals/CreateChannelModal";
import ContextMenu from "@/components/ui/ContextMenu";

function normalizeId(value) {
  if (!value) return null;
  return value.toString();
}

function DropZone({ id, children, className = "" }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "rounded-lg bg-violet-500/10" : ""}`}
    >
      {children}
    </div>
  );
}

function SortableChannel({ channel, active, onOpenMenu, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: channel._id,
    data: {
      type: "channel",
      channel,
    },
  });

  const Icon = channel.type === "voice" ? Volume2 : Hash;

  return (
    <button
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => onOpenMenu(e, channel)}
      onClick={onClick}
      className={`group flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition ${
        isDragging
          ? "opacity-40"
          : active
          ? "bg-white/[0.08] text-white"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon
        size={17}
        className="shrink-0 text-slate-500 group-hover:text-slate-300"
      />

      <span className="truncate">{channel.name}</span>
    </button>
  );
}

export default function ChannelSidebar() {
  const router = useRouter();
  const { serverId, channelId } = router.query;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const [server, setServer] = useState(null);
  const [membership, setMembership] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [serverMenuOpen, setServerMenuOpen] = useState(false);

  const [activeDragChannel, setActiveDragChannel] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("text");
  const [createParentId, setCreateParentId] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [blankMenu, setBlankMenu] = useState(null);

  const [editingChannel, setEditingChannel] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!serverId) return;
    loadSidebarData();
  }, [serverId]);

  async function loadSidebarData() {
    try {
      setLoading(true);

      const [serverRes, channelsRes] = await Promise.all([
        fetch(`/api/servers/get-server?serverId=${serverId}`),
        fetch(`/api/channels/get-channels?serverId=${serverId}`),
      ]);

      const serverData = await serverRes.json();
      const channelsData = await channelsRes.json();

      setServer(serverData.server || null);
      setMembership(serverData.membership || null);
      setChannels(channelsData.channels || []);
    } catch (error) {
      console.error("LOAD_CHANNEL_SIDEBAR_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  const isOwner = membership?.role === "owner";

  const categories = useMemo(
    () =>
      channels
        .filter((channel) => channel.type === "category")
        .sort((a, b) => a.position - b.position),
    [channels]
  );

  const uncategorizedChannels = useMemo(
    () =>
      channels
        .filter((channel) => channel.type !== "category" && !channel.parentId)
        .sort((a, b) => a.position - b.position),
    [channels]
  );

  function getCategoryChannels(categoryId) {
    return channels
      .filter(
        (channel) =>
          channel.type !== "category" &&
          normalizeId(channel.parentId) === normalizeId(categoryId)
      )
      .sort((a, b) => a.position - b.position);
  }

  function openCreateModal(type = "text", parentId = null) {
    setCreateType(type);
    setCreateParentId(parentId);
    setShowCreateModal(true);
    setContextMenu(null);
    setBlankMenu(null);
  }

  function openContextMenu(e, channel) {
    e.preventDefault();
    e.stopPropagation();

    setBlankMenu(null);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      channel,
    });
  }

  function openBlankMenu(e) {
    e.preventDefault();

    setContextMenu(null);
    setBlankMenu({
      x: e.clientX,
      y: e.clientY,
    });
  }

function handleInvitePeople() {
  setServerMenuOpen(false);
  setShowInviteModal(true);
}

  function handleEditServer() {
    setServerMenuOpen(false);
    console.log("Open edit server modal later");
  }

  async function handleLeaveServer() {
    setServerMenuOpen(false);

    const confirmed = confirm(`Leave "${server?.name}"?`);
    if (!confirmed) return;

    const res = await fetch("/api/servers/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ serverId }),
    });

    if (!res.ok) return;

    router.push("/app");
  }

  function handleEditChannel() {
    const channel = contextMenu?.channel;
    if (!channel) return;

    setEditingChannel(channel);
    setEditName(channel.name);
    setContextMenu(null);
  }

  async function handleSaveEdit() {
    if (!editingChannel || !editName.trim()) return;

    const res = await fetch("/api/channels/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId: editingChannel._id,
        name: editName,
      }),
    });

    const data = await res.json();

    if (!res.ok) return;

    setChannels((prev) =>
      prev.map((item) => (item._id === data.channel._id ? data.channel : item))
    );

    setEditingChannel(null);
    setEditName("");
  }

  async function handleDeleteChannel() {
    const channel = contextMenu?.channel;
    if (!channel) return;

    setContextMenu(null);

    const confirmed = confirm(
      `Delete ${channel.type === "category" ? "category" : "channel"} "${
        channel.name
      }"?`
    );

    if (!confirmed) return;

    const res = await fetch("/api/channels/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId: channel._id,
      }),
    });

    if (!res.ok) return;

    if (channel.type === "category") {
      setChannels((prev) =>
        prev
          .filter((item) => item._id !== channel._id)
          .map((item) =>
            normalizeId(item.parentId) === normalizeId(channel._id)
              ? { ...item, parentId: null }
              : item
          )
      );
      return;
    }

    setChannels((prev) => prev.filter((item) => item._id !== channel._id));

    if (channelId === channel._id) {
      router.push(`/app/server/${serverId}`);
    }
  }

  function handleChannelCreated(channel) {
    setChannels((prev) => [...prev, channel]);

    if (channel.type === "text") {
      router.push(`/app/server/${serverId}/channel/${channel._id}`);
    }
  }

  function getContainerId(channel) {
    if (channel.parentId) return `category:${channel.parentId}`;
    return "uncategorized";
  }

  function getParentIdFromContainer(containerId) {
    if (containerId?.startsWith("category:")) {
      return containerId.replace("category:", "");
    }

    return null;
  }

  function findChannel(id) {
    return channels.find((channel) => channel._id === id);
  }

  function findContainer(id) {
    if (!id) return null;

    if (id === "uncategorized" || id.startsWith("category:")) {
      return id;
    }

    const channel = findChannel(id);
    if (!channel) return null;

    return getContainerId(channel);
  }

  async function saveOrder(nextChannels) {
    await fetch("/api/channels/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serverId,
        channels: nextChannels.map((channel, index) => ({
          _id: channel._id,
          parentId: channel.parentId || null,
          position: index,
        })),
      }),
    });
  }

  function handleDragStart(event) {
    const channel = event.active.data.current?.channel;
    setActiveDragChannel(channel || null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    setActiveDragChannel(null);

    if (!over) return;

    const activeChannel = findChannel(active.id);
    if (!activeChannel || activeChannel.type === "category") return;

    const overChannel = findChannel(over.id);
    const overContainer = findContainer(over.id);

    if (!overContainer) return;

    const nextParentId = getParentIdFromContainer(overContainer);

    let nextChannels = channels.map((channel) =>
      channel._id === activeChannel._id
        ? {
            ...channel,
            parentId: nextParentId,
          }
        : channel
    );

    const sameContainerChannels = nextChannels
      .filter(
        (channel) =>
          channel.type !== "category" &&
          normalizeId(channel.parentId) === normalizeId(nextParentId)
      )
      .sort((a, b) => a.position - b.position);

    const activeIndex = sameContainerChannels.findIndex(
      (channel) => channel._id === activeChannel._id
    );

    let overIndex = sameContainerChannels.length - 1;

    if (overChannel && overChannel.type !== "category") {
      overIndex = sameContainerChannels.findIndex(
        (channel) => channel._id === overChannel._id
      );
    }

    if (activeIndex !== -1 && overIndex !== -1) {
      const reordered = [...sameContainerChannels];
      const [removed] = reordered.splice(activeIndex, 1);
      reordered.splice(overIndex, 0, removed);

      nextChannels = nextChannels.map((channel) => {
        const reorderedIndex = reordered.findIndex(
          (item) => item._id === channel._id
        );

        if (reorderedIndex === -1) return channel;

        return {
          ...channel,
          position: reorderedIndex,
        };
      });
    }

    setChannels(nextChannels);
    await saveOrder(nextChannels);
  }

  function renderChannel(channel) {
    const active = channelId === channel._id;

    return (
      <SortableChannel
        key={channel._id}
        channel={channel}
        active={active}
        onOpenMenu={openContextMenu}
        onClick={() => {
          if (channel.type === "text") {
            router.push(`/app/server/${serverId}/channel/${channel._id}`);
          }
        }}
      />
    );
  }

  function renderCategoryHeader(category, onAdd) {
    return (
      <div
        onContextMenu={(e) => openContextMenu(e, category)}
        className="mb-1 flex items-center justify-between px-2"
      >
        <button className="flex min-w-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-300">
          <ChevronDown size={12} className="shrink-0" />
          <span className="truncate">{category.name}</span>
        </button>

        <button
          onClick={onAdd}
          title="Create channel"
          className="text-slate-500 hover:text-white"
        >
          <Plus size={13} />
        </button>
      </div>
    );
  }

  return (
    <>
      <aside className="flex w-[270px] flex-col border-r border-white/10 bg-[#0b0f1d]">
        <div className="relative">
          <button
            onClick={() => setServerMenuOpen((prev) => !prev)}
            className="flex h-14 w-full items-center justify-between border-b border-white/10 px-4 text-left transition hover:bg-white/[0.04]"
          >
            <h2 className="truncate font-black">
              {loading ? "Loading..." : server?.name || "Unknown Server"}
            </h2>

            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition ${
                serverMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {serverMenuOpen && (
            <>
              <button
                className="fixed inset-0 z-[9997]"
                onClick={() => setServerMenuOpen(false)}
              />

              <div className="absolute left-2 right-2 top-16 z-[9998] rounded-xl border border-white/10 bg-[#111827] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <button
                  onClick={handleInvitePeople}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
                >
                  Invite People
                  <UserPlus size={16} />
                </button>

                <button
                  onClick={handleEditServer}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white"
                >
                  Edit Server
                  <Settings size={16} />
                </button>

                {!isOwner && (
                  <>
                    <div className="my-1 h-px bg-white/10" />

                    <button
                      onClick={handleLeaveServer}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      Leave Server
                      <LogOut size={16} />
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            onContextMenu={openBlankMenu}
            className="flex-1 overflow-y-auto p-3"
          >
            <button className="mb-3 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white">
              Browse Channels
            </button>

            {channels.length === 0 && (
              <div className="mb-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-500">
                Right-click here to create your first category or channel.
              </div>
            )}

            <div className="space-y-3">
              <DropZone
                id="uncategorized"
                className="min-h-[34px] rounded-lg border border-dashed border-white/5 p-1"
              >
                <SortableContext
                  items={uncategorizedChannels.map((channel) => channel._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0.5">
                    {uncategorizedChannels.length === 0 ? (
                      <p className="px-2 py-1 text-xs text-slate-600">
                        Drop here to remove from category
                      </p>
                    ) : (
                      uncategorizedChannels.map(renderChannel)
                    )}
                  </div>
                </SortableContext>
              </DropZone>

              {categories.map((category) => {
                const categoryChannels = getCategoryChannels(category._id);

                return (
                  <DropZone key={category._id} id={`category:${category._id}`}>
                    <div>
                      {renderCategoryHeader(category, () =>
                        openCreateModal("text", category._id)
                      )}

                      <SortableContext
                        items={categoryChannels.map((channel) => channel._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="min-h-[22px] space-y-0.5 rounded-lg">
                          {categoryChannels.length === 0 ? (
                            <p className="px-2 py-1 text-xs text-slate-600">
                              Drop channels here
                            </p>
                          ) : (
                            categoryChannels.map(renderChannel)
                          )}
                        </div>
                      </SortableContext>
                    </div>
                  </DropZone>
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeDragChannel ? (
              <div className="flex w-56 items-center gap-2 rounded-md bg-[#111827] px-2 py-1 text-sm text-white shadow-2xl">
                {activeDragChannel.type === "voice" ? (
                  <Volume2 size={17} />
                ) : (
                  <Hash size={17} />
                )}
                <span className="truncate">{activeDragChannel.name}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <UserPanel />
      </aside>

      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        serverId={serverId}
        defaultType={createType}
        parentId={createParentId}
        onChannelCreated={handleChannelCreated}
      />

      <ContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onEdit={handleEditChannel}
        onDelete={handleDeleteChannel}
        editLabel={`Edit ${
          contextMenu?.channel?.type === "category" ? "Category" : "Channel"
        }`}
        deleteLabel={`Delete ${
          contextMenu?.channel?.type === "category" ? "Category" : "Channel"
        }`}
      />

      {blankMenu && (
        <>
          <button
            className="fixed inset-0 z-[9998] cursor-default"
            onClick={() => setBlankMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setBlankMenu(null);
            }}
          />

          <div
            style={{ top: blankMenu.y, left: blankMenu.x }}
            className="fixed z-[9999] w-56 rounded-xl border border-white/10 bg-[#111827] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <button
              onClick={() => openCreateModal("category")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white"
            >
              Create Category
              <FolderPlus size={15} />
            </button>

            <button
              onClick={() => openCreateModal("text", null)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white"
            >
              Create Text Channel
              <Hash size={15} />
            </button>

            <button
              onClick={() => openCreateModal("voice", null)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white"
            >
              Create Voice Channel
              <Volume2 size={15} />
            </button>
          </div>
        </>
      )}

      {editingChannel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f1d] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">
                Edit{" "}
                {editingChannel.type === "category" ? "Category" : "Channel"}
              </h2>

              <button
                onClick={() => setEditingChannel(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Channel name"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-violet-500"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingChannel(null)}
                className="flex-1 rounded-xl border border-white/10 py-3 font-bold text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="flex-1 rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showInviteModal && (
        <InvitePeopleModal
            serverId={serverId}
            serverName={server?.name}
            onClose={() => setShowInviteModal(false)}
        />
        )}
    </>
  );
}
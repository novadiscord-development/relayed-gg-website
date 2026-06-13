import Role from "@/models/Role";
import Channel from "@/models/Channel";
import { getMemberPermissions } from "@/lib/permissions";

function normalizeId(value) {
  return value?._id?.toString?.() || value?.toString?.() || "";
}

function applyOverwrite(permissions, overwrite) {
  const next = { ...permissions };

  Object.entries(overwrite?.deny || {}).forEach(([key, value]) => {
    if (value === true) next[key] = false;
  });

  Object.entries(overwrite?.allow || {}).forEach(([key, value]) => {
    if (value === true) next[key] = true;
  });

  return next;
}

function memberRoleIds(member) {
  return (member?.roles || []).map((role) => normalizeId(role));
}

export async function getChannelPermissions(member, channelOrId) {
  const basePermissions = await getMemberPermissions(member);

  if (!member) return basePermissions;
  if (member.role === "owner") return basePermissions;

  const channel =
    typeof channelOrId === "string" || channelOrId?._bsontype === "ObjectID"
      ? await Channel.findById(channelOrId).lean()
      : channelOrId;

  if (!channel) return basePermissions;

  let permissions = { ...basePermissions };
  const overwrites = channel.permissionOverwrites || [];

  const everyoneOverwrite = overwrites.find(
    (overwrite) => overwrite.targetType === "everyone"
  );

  if (everyoneOverwrite) {
    permissions = applyOverwrite(permissions, everyoneOverwrite);
  }

  const roleIds = memberRoleIds(member);
  const roleOverwrites = overwrites.filter(
    (overwrite) =>
      overwrite.targetType === "role" && roleIds.includes(normalizeId(overwrite.targetId))
  );

  roleOverwrites.forEach((overwrite) => {
    permissions = applyOverwrite(permissions, overwrite);
  });

  const memberOverwrite = overwrites.find(
    (overwrite) =>
      overwrite.targetType === "member" && normalizeId(overwrite.targetId) === normalizeId(member.userId)
  );

  if (memberOverwrite) {
    permissions = applyOverwrite(permissions, memberOverwrite);
  }

  return permissions;
}

export async function hasChannelPermission(member, channelOrId, permission) {
  const permissions = await getChannelPermissions(member, channelOrId);
  return Boolean(permissions[permission]);
}

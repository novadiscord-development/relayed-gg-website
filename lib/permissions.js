import Role from "@/models/Role";
import ensureEveryoneRole from "@/lib/ensureEveryoneRole";

export const ALL_PERMISSIONS = {
  manageServer: true,
  manageChannels: true,
  manageRoles: true,
  kickMembers: true,
  banMembers: true,
  timeoutMembers: true,
  manageMessages: true,
  mentionEveryone: true,
  sendMessages: true,
  attachFiles: true,
  viewChannels: true,
};

export const EMPTY_PERMISSIONS = {
  manageServer: false,
  manageChannels: false,
  manageRoles: false,
  kickMembers: false,
  banMembers: false,
  timeoutMembers: false,
  manageMessages: false,
  mentionEveryone: false,
  sendMessages: false,
  attachFiles: false,
  viewChannels: false,
};

export function mergePermissions(basePermissions, rolePermissions) {
  const merged = {
    ...basePermissions,
  };

  Object.entries(rolePermissions || {}).forEach(([key, value]) => {
    if (value === true) {
      merged[key] = true;
    }
  });

  return merged;
}

export async function getMemberPermissions(member) {
  if (!member) {
    return EMPTY_PERMISSIONS;
  }

  if (member.role === "owner") {
    return ALL_PERMISSIONS;
  }

  const everyoneRole = await ensureEveryoneRole(member.serverId);

  let permissions = {
    ...EMPTY_PERMISSIONS,
    ...(everyoneRole?.permissions || {}),
  };

  const memberRoleIds = (member.roles || []).map((role) =>
    role?._id ? role._id : role
  );

  if (!memberRoleIds.length) {
    return permissions;
  }

  const roles = await Role.find({
    _id: { $in: memberRoleIds },
    serverId: member.serverId,
    isEveryone: { $ne: true },
  }).lean();

  roles.forEach((role) => {
    permissions = mergePermissions(permissions, role.permissions);
  });

  return permissions;
}

export async function hasPermission(member, permission) {
  const permissions = await getMemberPermissions(member);
  return Boolean(permissions[permission]);
}

export async function hasAnyPermission(member, permissionsToCheck = []) {
  const permissions = await getMemberPermissions(member);

  return permissionsToCheck.some((permission) =>
    Boolean(permissions[permission])
  );
}

export function memberHasRole(member, roleId) {
  return (member?.roles || []).some(
    (role) => (role?._id || role).toString() === roleId.toString()
  );
}

export async function canManageTarget(actorMember, targetMember) {
  if (!actorMember || !targetMember) return false;

  if (actorMember._id?.toString() === targetMember._id?.toString()) {
    return false;
  }

  if (targetMember.role === "owner") {
    return false;
  }

  if (actorMember.role === "owner") {
    return true;
  }

  const actorPermissions = await getMemberPermissions(actorMember);

  return Boolean(
    actorPermissions.kickMembers ||
      actorPermissions.banMembers ||
      actorPermissions.timeoutMembers ||
      actorPermissions.manageRoles
  );
}
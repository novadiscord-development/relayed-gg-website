import Role from "@/models/Role";

export const SYSTEM_PERMISSIONS = {
  owner: {
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
  },

  admin: {
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
  },

  moderator: {
    manageServer: false,
    manageChannels: false,
    manageRoles: false,
    kickMembers: true,
    banMembers: false,
    timeoutMembers: true,
    manageMessages: true,
    mentionEveryone: false,
    sendMessages: true,
    attachFiles: true,
    viewChannels: true,
  },

  member: {
    manageServer: false,
    manageChannels: false,
    manageRoles: false,
    kickMembers: false,
    banMembers: false,
    timeoutMembers: false,
    manageMessages: false,
    mentionEveryone: false,
    sendMessages: true,
    attachFiles: true,
    viewChannels: true,
  },
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
    return SYSTEM_PERMISSIONS.member;
  }

  let permissions =
    SYSTEM_PERMISSIONS[member.role] || SYSTEM_PERMISSIONS.member;

  if (!member.roles?.length) {
    return permissions;
  }

  const roles = await Role.find({
    _id: { $in: member.roles },
    serverId: member.serverId,
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

export function canManageTarget(actorMember, targetMember) {
  if (!actorMember || !targetMember) return false;

  if (actorMember.role === "owner") return targetMember.role !== "owner";
  if (actorMember.role === "admin") {
    return !["owner", "admin"].includes(targetMember.role);
  }

  if (actorMember.role === "moderator") {
    return targetMember.role === "member";
  }

  return false;
}
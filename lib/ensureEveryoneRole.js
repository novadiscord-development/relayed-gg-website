import Role from "@/models/Role";

export const EVERYONE_PERMISSIONS = {
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
};

export default async function ensureEveryoneRole(serverId) {
  if (!serverId) return null;

  const existingRole = await Role.findOne({
    serverId,
    isEveryone: true,
  });

  if (existingRole) return existingRole;

  return Role.create({
    serverId,
    name: "@everyone",
    color: "#99aab5",
    position: 0,
    managed: true,
    isEveryone: true,
    permissions: EVERYONE_PERMISSIONS,
  });
}
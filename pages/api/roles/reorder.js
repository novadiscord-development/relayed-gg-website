import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Role from "@/models/Role";
import AuditLog from "@/models/AuditLog";
import { hasPermission, canManageRole } from "@/lib/permissions";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId, roleIds = [] } = req.body;

    if (!serverId || !Array.isArray(roleIds)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const cleanRoleIds = roleIds
      .filter(Boolean)
      .map((roleId) => roleId.toString());

    const uniqueRoleIds = [...new Set(cleanRoleIds)];

    if (uniqueRoleIds.length !== cleanRoleIds.length) {
      return res.status(400).json({ message: "Duplicate roles are not allowed" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership || !(await hasPermission(membership, "manageRoles"))) {
      return res.status(403).json({
        message: "You do not have permission to manage roles",
      });
    }

    const roles = await Role.find({
      serverId,
      isEveryone: { $ne: true },
      managed: { $ne: true },
    });

    const existingRoleIds = roles.map((role) => role._id.toString());

    const missingRole = uniqueRoleIds.some(
      (roleId) => !existingRoleIds.includes(roleId)
    );

    if (missingRole || uniqueRoleIds.length !== existingRoleIds.length) {
      return res.status(400).json({
        message: "Role order must include every editable custom role",
      });
    }

    const rolesById = new Map(
      roles.map((role) => [role._id.toString(), role])
    );

    for (const roleId of uniqueRoleIds) {
      const role = rolesById.get(roleId);

      if (!(await canManageRole(membership, role))) {
        return res.status(403).json({
          message: "You cannot reorder a role equal to or higher than your highest role",
        });
      }
    }

    await Promise.all(
      uniqueRoleIds.map((roleId, index) =>
        Role.updateOne(
          {
            _id: roleId,
            serverId,
            isEveryone: { $ne: true },
            managed: { $ne: true },
          },
          {
            $set: {
              position: uniqueRoleIds.length - index,
            },
          }
        )
      )
    );

    await Role.updateOne(
      {
        serverId,
        isEveryone: true,
      },
      {
        $set: {
          position: 0,
        },
      }
    );

    await AuditLog.create({
      serverId,
      action: "role_update",
      actorId: session.user.id,
      metadata: {
        reordered: true,
        roleIds: uniqueRoleIds,
      },
    });

    const updatedRoles = await Role.find({ serverId })
      .sort({
        isEveryone: 1,
        position: -1,
      })
      .lean();

    return res.status(200).json({ roles: updatedRoles });
  } catch (error) {
    console.error("REORDER_ROLES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Role from "@/models/Role";
import AuditLog from "@/models/AuditLog";
import { hasPermission, canManageRole } from "@/lib/permissions";

function cleanColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color || "") ? color : "#99aab5";
}

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

    const { serverId, roleId, name, color, permissions = {} } = req.body;

    if (!serverId || !roleId) {
      return res.status(400).json({
        message: "Server ID and role ID are required",
      });
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

    const role = await Role.findOne({
      _id: roleId,
      serverId,
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (role.isEveryone) {
      if (membership.role !== "owner" && !(await hasPermission(membership, "manageRoles"))) {
        return res.status(403).json({
          message: "You do not have permission to edit @everyone",
        });
      }

      Object.entries(permissions || {}).forEach(([key, value]) => {
        if (role.permissions?.[key] !== undefined) {
          role.permissions[key] = Boolean(value);
        }
      });
    } else {
      if (!(await canManageRole(membership, role))) {
        return res.status(403).json({
          message: "You cannot edit a role equal to or higher than your highest role",
        });
      }

      if (typeof name === "string") {
        const cleanName = name.trim();

        if (!cleanName || cleanName.length > 40) {
          return res.status(400).json({
            message: "Role name must be 1-40 characters",
          });
        }

        if (cleanName.toLowerCase() === "@everyone") {
          return res.status(400).json({
            message: "Only the managed @everyone role can use that name",
          });
        }

        role.name = cleanName;
      }

      if (typeof color === "string") {
        role.color = cleanColor(color);
      }

      Object.entries(permissions || {}).forEach(([key, value]) => {
        if (role.permissions?.[key] !== undefined) {
          role.permissions[key] = Boolean(value);
        }
      });
    }

    await role.save();

    await AuditLog.create({
      serverId,
      action: "role_update",
      actorId: session.user.id,
      metadata: {
        roleId: role._id,
        roleName: role.name,
        isEveryone: role.isEveryone,
      },
    });

    return res.status(200).json({ role });
  } catch (error) {
    console.error("UPDATE_ROLE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

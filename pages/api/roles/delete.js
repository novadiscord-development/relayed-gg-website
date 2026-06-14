import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Role from "@/models/Role";
import AuditLog from "@/models/AuditLog";
import { hasPermission, canManageRole } from "@/lib/permissions";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId, roleId } = req.body;

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

    if (role.isEveryone || role.managed) {
      return res.status(400).json({
        message: "This role cannot be deleted",
      });
    }

    if (!(await canManageRole(membership, role))) {
      return res.status(403).json({
        message: "You cannot delete a role equal to or higher than your highest role",
      });
    }

    await Member.updateMany({ serverId }, { $pull: { roles: role._id } });
    await Role.deleteOne({ _id: role._id });

    await AuditLog.create({
      serverId,
      action: "role_delete",
      actorId: session.user.id,
      metadata: {
        roleId: role._id,
        roleName: role.name,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("DELETE_ROLE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Role from "@/models/Role";
import AuditLog from "@/models/AuditLog";
import { hasPermission, canAssignRole, canManageTarget } from "@/lib/permissions";

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

    const { serverId, memberId, roleId, action } = req.body;

    if (!serverId || !memberId || !roleId || !["add", "remove"].includes(action)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const actorMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!actorMember || !(await hasPermission(actorMember, "manageRoles"))) {
      return res.status(403).json({
        message: "You do not have permission to assign roles",
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
        message: "@everyone is assigned automatically",
      });
    }

    if (!(await canAssignRole(actorMember, role))) {
      return res.status(403).json({
        message: "You cannot assign or remove a role equal to or higher than your highest role",
      });
    }

    const targetMember = await Member.findOne({
      _id: memberId,
      serverId,
    });

    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({
        message: "You cannot edit the server owner's roles",
      });
    }

    if (!(await canManageTarget(actorMember, targetMember))) {
      return res.status(403).json({
        message: "You cannot manage a member equal to or higher than you",
      });
    }

    const update =
      action === "add"
        ? { $addToSet: { roles: role._id } }
        : { $pull: { roles: role._id } };

    const member = await Member.findOneAndUpdate(
      { _id: memberId, serverId },
      update,
      { new: true }
    )
      .populate("userId", "username avatar image isStaff isAdmin badges")
      .populate({
        path: "roles",
        match: { isEveryone: { $ne: true } },
        options: { sort: { position: -1 } },
      });

    await AuditLog.create({
      serverId,
      action: "role_update",
      actorId: session.user.id,
      targetUserId: targetMember.userId,
      metadata: {
        roleId: role._id,
        roleName: role.name,
        action,
      },
    });

    return res.status(200).json({ member });
  } catch (error) {
    console.error("ASSIGN_ROLE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

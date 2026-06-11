import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import AuditLog from "@/models/AuditLog";

const allowedRoles = ["admin", "moderator", "member"];

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, memberId, role } = req.body;

    if (!serverId || !memberId || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const currentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!currentMember || currentMember.role !== "owner") {
      return res.status(403).json({ message: "Only the owner can change roles" });
    }

    const targetMember = await Member.findOne({
      _id: memberId,
      serverId,
    });

    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({ message: "You cannot change the owner role" });
    }

    targetMember.role = role;
    await targetMember.save();

    const updatedMember = await targetMember.populate(
      "userId",
      "username avatar isStaff isAdmin badges"
    );

    await AuditLog.create({
      serverId,
      action: "role_update",
      actorId: session.user.id,
      targetUserId: member.userId,
      metadata: {
        role,
      },
    });

    return res.status(200).json({
      member: updatedMember,
    });
  } catch (error) {
    console.error("UPDATE_MEMBER_ROLE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import ServerTimeout from "@/models/ServerTimeout";
import AuditLog from "@/models/AuditLog";
import { pusherServer } from "@/lib/pusher";
import { hasPermission, canManageTarget } from "@/lib/permissions";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId, memberId, reason = "" } = req.body;

    if (!serverId || !memberId) {
      return res.status(400).json({
        message: "Server ID and member ID are required",
      });
    }

    const moderatorMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!moderatorMember || !(await hasPermission(moderatorMember, "timeoutMembers"))) {
      return res.status(403).json({
        message: "You do not have permission to remove timeouts",
      });
    }

    const targetMember = await Member.findById(memberId);

    if (!targetMember || targetMember.serverId.toString() !== serverId) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (targetMember.userId.toString() === session.user.id.toString()) {
      return res.status(400).json({
        message: "You cannot remove your own timeout",
      });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({
        message: "You cannot remove timeout from the server owner",
      });
    }

    if (!(await canManageTarget(moderatorMember, targetMember))) {
      return res.status(403).json({
        message: "You cannot remove timeout from a member with an equal or higher role",
      });
    }

    await ServerTimeout.findOneAndDelete({
      serverId,
      userId: targetMember.userId,
    });

    const cleanReason = String(reason || "").trim().slice(0, 500);

    await pusherServer.trigger(`server-${serverId}`, "member:timeout_removed", {
      memberId: targetMember._id,
      userId: targetMember.userId,
      serverId,
    });

    await AuditLog.create({
      serverId,
      action: "member_timeout_removed",
      actorId: session.user.id,
      targetUserId: targetMember.userId,
      reason: cleanReason,
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("REMOVE_TIMEOUT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import ServerTimeout from "@/models/ServerTimeout";
import AuditLog from "@/models/AuditLog";
import { pusherServer } from "@/lib/pusher";
import { hasPermission, canManageTarget } from "@/lib/permissions";

const DURATIONS = {
  "5m": 5 * 60 * 1000,
  "10m": 10 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId, memberId, duration = "1h", reason = "" } = req.body;

    if (!serverId || !memberId) {
      return res.status(400).json({
        message: "Server ID and member ID are required",
      });
    }

    if (!DURATIONS[duration]) {
      return res.status(400).json({
        message: "Invalid timeout duration",
      });
    }

    const moderatorMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!moderatorMember || !(await hasPermission(moderatorMember, "timeoutMembers"))) {
      return res.status(403).json({
        message: "You do not have permission to timeout members",
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
        message: "You cannot timeout yourself",
      });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({
        message: "You cannot timeout the server owner",
      });
    }

    if (!(await canManageTarget(moderatorMember, targetMember))) {
      return res.status(403).json({
        message: "You cannot timeout a member with an equal or higher role",
      });
    }

    const cleanReason = String(reason || "").trim().slice(0, 500);
    const expiresAt = new Date(Date.now() + DURATIONS[duration]);

    const timeout = await ServerTimeout.findOneAndUpdate(
      {
        serverId,
        userId: targetMember.userId,
      },
      {
        $set: {
          serverId,
          userId: targetMember.userId,
          moderatorId: session.user.id,
          reason: cleanReason,
          expiresAt,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    await pusherServer.trigger(`server-${serverId}`, "member:timeout", {
      memberId: targetMember._id,
      userId: targetMember.userId,
      serverId,
      expiresAt,
    });

    await AuditLog.create({
      serverId,
      action: "member_timeout",
      actorId: session.user.id,
      targetUserId: targetMember.userId,
      reason: cleanReason,
      metadata: {
        duration,
        expiresAt,
      },
    });

    return res.status(200).json({
      success: true,
      timeout,
    });
  } catch (error) {
    console.error("TIMEOUT_MEMBER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

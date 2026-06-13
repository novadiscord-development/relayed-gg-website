import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import User from "@/models/User";
import ServerBan from "@/models/ServerBan";
import { pusherServer } from "@/lib/pusher";
import AuditLog from "@/models/AuditLog";
import { hasPermission } from "@/lib/permissions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, memberId, reason = "" } = req.body;

    if (!serverId || !memberId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!currentMember || !(await hasPermission(currentMember, "banMembers"))) {
      return res.status(403).json({ message: "No permission" });
    }

    const targetMember = await Member.findOne({
      _id: memberId,
      serverId,
    }).populate("userId", "username");

    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({ message: "You cannot ban the owner" });
    }

    if (currentMember._id.toString() === targetMember._id.toString()) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }

    const cleanReason = String(reason || "").trim().slice(0, 500);
    const bannedUserId = targetMember.userId._id;
    const bannedUsername = targetMember.userId?.username || "Someone";

    const moderator = await User.findById(session.user.id).select("username");
    const moderatorUsername = moderator?.username || "a moderator";

    await ServerBan.findOneAndUpdate(
      {
        serverId,
        userId: bannedUserId,
      },
      {
        serverId,
        userId: bannedUserId,
        bannedBy: session.user.id,
        reason: cleanReason,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    await Member.findByIdAndDelete(targetMember._id);

    const firstTextChannel = await Channel.findOne({
      serverId,
      type: "text",
    }).sort({
      position: 1,
      createdAt: 1,
    });

    if (firstTextChannel) {
      let systemMessage = await Message.create({
        serverId,
        channelId: firstTextChannel._id,
        authorId: session.user.id,
        content: `${bannedUsername} was banned from the server by ${moderatorUsername}.`,
        system: true,
      });

      systemMessage = await systemMessage.populate(
        "authorId",
        "username avatar isStaff isAdmin badges"
      );

      await pusherServer.trigger(
        `channel-${firstTextChannel._id}`,
        "message:new",
        systemMessage
      );
    }

    await AuditLog.create({
      serverId,
      action: "member_ban",
      actorId: session.user.id,
      targetUserId: targetMember.userId,
      reason: cleanReason,
    });

    return res.status(200).json({
      success: true,
      memberId,
    });
  } catch (error) {
    console.error("BAN_MEMBER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

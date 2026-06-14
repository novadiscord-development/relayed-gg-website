import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import User from "@/models/User";
import { pusherServer } from "@/lib/pusher";
import { hasPermission, canManageTarget } from "@/lib/permissions";

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

    const { serverId, memberId } = req.body;

    if (!serverId || !memberId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!currentMember || !(await hasPermission(currentMember, "kickMembers"))) {
      return res.status(403).json({ message: "No permission" });
    }

    const targetMember = await Member.findOne({
      _id: memberId,
      serverId,
    }).populate("userId", "username");

    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (currentMember._id.toString() === targetMember._id.toString()) {
      return res.status(400).json({ message: "You cannot kick yourself" });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({ message: "You cannot kick the owner" });
    }

    if (!(await canManageTarget(currentMember, targetMember))) {
      return res.status(403).json({
        message: "You cannot kick a member with an equal or higher role",
      });
    }

    const kickedUsername = targetMember.userId?.username || "Someone";

    const moderator = await User.findById(session.user.id).select("username");
    const moderatorUsername = moderator?.username || "a moderator";

    await Member.findByIdAndDelete(targetMember._id);

    await pusherServer.trigger(`server-${serverId}`, "member:kicked", {
      memberId: targetMember._id,
      userId: targetMember.userId?._id || targetMember.userId,
      serverId,
    });

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
        content: `${kickedUsername} was kicked from the server by ${moderatorUsername}.`,
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
      action: "member_kick",
      actorId: session.user.id,
      targetUserId: targetMember.userId,
    });

    return res.status(200).json({
      success: true,
      memberId,
    });
  } catch (error) {
    console.error("KICK_MEMBER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

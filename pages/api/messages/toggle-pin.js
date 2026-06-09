import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Message from "@/models/Message";
import { pusherServer } from "@/lib/pusher";

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

    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    const message = await Message.findById(messageId);

    if (!message || message.deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    const member = await Member.findOne({
      serverId: message.serverId,
      userId: session.user.id,
    });

    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const canPin = ["owner", "admin", "moderator"].includes(member.role);

    if (!canPin) {
      return res.status(403).json({ message: "You cannot pin messages" });
    }

    const nextPinned = !message.pinned;

    message.pinned = nextPinned;
    message.pinnedBy = nextPinned ? session.user.id : null;
    message.pinnedAt = nextPinned ? new Date() : null;

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("authorId", "username avatar image isStaff isAdmin badges")
      .populate("pinnedBy", "username avatar image")
      .populate({
        path: "replyToId",
        select: "content authorId createdAt",
        populate: {
          path: "authorId",
          select: "username avatar image isStaff isAdmin badges",
        },
      });

    await pusherServer.trigger(
      `channel-${message.channelId}`,
      "message:update",
      updatedMessage
    );

    return res.status(200).json({ message: updatedMessage });
  } catch (error) {
    console.error("TOGGLE_PIN_MESSAGE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
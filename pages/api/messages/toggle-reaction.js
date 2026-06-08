import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Message from "@/models/Message";
import { pusherServer } from "@/lib/pusher";

const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "🔥", "😭", "💀", "👀", "🎉"];

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

    const { messageId, emoji } = req.body;

    if (!messageId || !emoji) {
      return res.status(400).json({ message: "Message ID and emoji required" });
    }

    if (!ALLOWED_REACTIONS.includes(emoji)) {
      return res.status(400).json({ message: "Invalid reaction" });
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

    const userId = session.user.id.toString();
    const reactions = message.reactions || [];

    const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);

    if (existingReaction) {
      const hasReacted = existingReaction.userIds.some(
        (id) => id.toString() === userId
      );

      if (hasReacted) {
        existingReaction.userIds = existingReaction.userIds.filter(
          (id) => id.toString() !== userId
        );
      } else {
        existingReaction.userIds.push(session.user.id);
      }
    } else {
      reactions.push({
        emoji,
        userIds: [session.user.id],
      });
    }

    message.reactions = reactions.filter(
      (reaction) => reaction.userIds.length > 0
    );

    message.markModified("reactions");

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("authorId", "username avatar isStaff isAdmin badges")
      .populate({
        path: "replyToId",
        select: "content authorId createdAt",
        populate: {
          path: "authorId",
          select: "username avatar isStaff isAdmin badges",
        },
      });

    await pusherServer.trigger(
      `channel-${message.channelId}`,
      "message:update",
      updatedMessage
    );

    return res.status(200).json({ message: updatedMessage });
  } catch (error) {
    console.error("TOGGLE_REACTION_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
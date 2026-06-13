import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Member from "@/models/Member";
import { pusherServer } from "@/lib/pusher";
import { hasPermission } from "@/lib/permissions";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { messageId, content } = req.body;

    if (!messageId || !content?.trim()) {
      return res.status(400).json({ message: "Message ID and content required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const member = await Member.findOne({
      serverId: message.serverId,
      userId: session.user.id,
    });

    if (!member) {
      return res.status(403).json({ message: "You are not in this server" });
    }

    if (message.authorId?.toString() !== session.user.id) {
      return res.status(403).json({ message: "You cannot edit this message" });
    }

    if (!(await hasPermission(member, "sendMessages"))) {
      return res.status(403).json({ message: "You cannot edit messages here" });
    }

    message.content = content.trim().slice(0, 2000);
    message.edited = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("authorId", "username avatar image isStaff isAdmin badges")
      .populate({
        path: "replyToId",
        select: "content authorId createdAt deleted",
        populate: {
          path: "authorId",
          select: "username avatar image isStaff isAdmin badges",
        },
      });

    await pusherServer.trigger(
      `channel-${message.channelId}`,
      "message:update",
      populatedMessage
    );

    return res.status(200).json({ message: populatedMessage });
  } catch (error) {
    console.error("UPDATE_MESSAGE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

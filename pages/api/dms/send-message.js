import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import DMMessage from "@/models/DMMessage";
import { pusherServer } from "@/lib/pusher";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { conversationId, content, replyToId = null } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: "Message is too long" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === session.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let replyToMessage = null;

    if (replyToId) {
      replyToMessage = await DMMessage.findOne({
        _id: replyToId,
        conversationId,
      });

      if (!replyToMessage) {
        return res.status(404).json({ message: "Reply message not found" });
      }
    }

    let message = await DMMessage.create({
      conversationId,
      authorId: session.user.id,
      replyToId: replyToMessage?._id || null,
      content: content.trim(),
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessageId: message._id,
        lastMessageAt: message.createdAt,
      },
    });

    message = await DMMessage.findById(message._id)
      .populate("authorId", "username avatar image isStaff isAdmin badges")
      .populate({
        path: "replyToId",
        select: "content authorId createdAt",
        populate: {
          path: "authorId",
          select: "username avatar image isStaff isAdmin badges",
        },
      });

    await pusherServer.trigger(
      `dm-${conversationId}`,
      "dm:message:new",
      message
    );

    await pusherServer.trigger(
      `user-${conversation.participants[0]}`,
      "dm:conversation:update",
      {
        conversationId,
        message,
      }
    );

    await pusherServer.trigger(
      `user-${conversation.participants[1]}`,
      "dm:conversation:update",
      {
        conversationId,
        message,
      }
    );

    return res.status(201).json({ message });
  } catch (error) {
    console.error("SEND_DM_MESSAGE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
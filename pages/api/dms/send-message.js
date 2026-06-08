import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import DMMessage from "@/models/DMMessage";
import DMNotification from "@/models/DMNotification";
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

    const {
      conversationId,
      content = "",
      replyToId = null,
      attachments = [],
    } = req.body;

    const cleanContent = content.trim();
    const cleanAttachments = Array.isArray(attachments)
      ? attachments.filter((item) => item?.url)
      : [];

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    if (!cleanContent && cleanAttachments.length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (cleanContent.length > 2000) {
      return res.status(400).json({ message: "Message is too long" });
    }

    if (cleanAttachments.length > 10) {
      return res.status(400).json({ message: "Too many attachments" });
    }

    const safeAttachments = cleanAttachments.map((attachment) => ({
      url: attachment.url,
      type: attachment.type || "image",
      name: attachment.name || "",
      size: attachment.size || 0,
    }));

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
      content: cleanContent,
      attachments: safeAttachments,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessageId: message._id,
        lastMessageAt: message.createdAt,
      },
    });

    const recipientIds = conversation.participants.filter(
      (participant) => participant.toString() !== session.user.id.toString()
    );

    await Promise.all(
      recipientIds.map((recipientId) =>
        DMNotification.findOneAndUpdate(
          {
            userId: recipientId,
            conversationId,
          },
          {
            $set: {
              unread: true,
              lastMessageAt: message.createdAt,
            },
          },
          {
            upsert: true,
            returnDocument: "after",
            setDefaultsOnInsert: true,
          }
        )
      )
    );

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

    for (const participant of conversation.participants) {
      await pusherServer.trigger(
        `user-${participant}`,
        "dm:conversation:update",
        {
          conversationId,
          message,
          unread: participant.toString() !== session.user.id.toString(),
        }
      );
    }

    return res.status(201).json({ message });
  } catch (error) {
    console.error("SEND_DM_MESSAGE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
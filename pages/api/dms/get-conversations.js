import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import DMMessage from "@/models/DMMessage";
import DMNotification from "@/models/DMNotification";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const conversations = await Conversation.find({
      participants: session.user.id,
    })
      .populate("participants", "username avatar image isStaff isAdmin badges")
      .populate({
        path: "lastMessageId",
        select: "content authorId createdAt deleted attachments",
        model: DMMessage,
        populate: {
          path: "authorId",
          select: "username avatar image",
        },
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const notifications = await DMNotification.find({
      userId: session.user.id,
    }).lean();

    const notificationMap = {};

    notifications.forEach((notification) => {
      notificationMap[notification.conversationId.toString()] = {
        unread: Boolean(notification.unread),
        mentions: notification.mentions || 0,
        lastMessageAt: notification.lastMessageAt || null,
      };
    });

    const conversationsWithNotifications = conversations.map(
      (conversation) => ({
        ...conversation,
        notification: notificationMap[conversation._id.toString()] || {
          unread: false,
          mentions: 0,
          lastMessageAt: null,
        },
      })
    );

    return res.status(200).json({
      conversations: conversationsWithNotifications,
    });
  } catch (error) {
    console.error("GET_DM_CONVERSATIONS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
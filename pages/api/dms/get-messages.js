import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import DMMessage from "@/models/DMMessage";

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

    const { conversationId } = req.query;

    if (!conversationId) {
      return res
        .status(400)
        .json({ message: "Conversation ID is required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participant) =>
        participant.toString() === session.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const messages = await DMMessage.find({
      conversationId,
    })
      .populate(
        "authorId",
        "username avatar image isStaff isAdmin"
      )
      .populate({
        path: "replyToId",
        populate: {
          path: "authorId",
          select: "username avatar image",
        },
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("GET_DM_MESSAGES_ERROR", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
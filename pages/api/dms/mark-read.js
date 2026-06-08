import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import DMNotification from "@/models/DMNotification";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
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

    await DMNotification.findOneAndUpdate(
      {
        userId: session.user.id,
        conversationId,
      },
      {
        $set: {
          unread: false,
          mentions: 0,
        },
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("MARK_DM_READ_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
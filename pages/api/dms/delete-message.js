import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import DMMessage from "@/models/DMMessage";
import { pusherServer } from "@/lib/pusher";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    const message = await DMMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.authorId.toString() !== session.user.id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await DMMessage.findByIdAndDelete(messageId);

    await pusherServer.trigger(
      `dm-${message.conversationId}`,
      "dm:message:delete",
      { messageId }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("DELETE_DM_MESSAGE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
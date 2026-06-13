import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Member from "@/models/Member";
import { pusherServer } from "@/lib/pusher";
import { hasPermission } from "@/lib/permissions";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const membership = await Member.findOne({
      serverId: message.serverId,
      userId: session.user.id,
    });

    if (!membership) {
      return res.status(403).json({ message: "You are not in this server" });
    }

    const isAuthor = message.authorId?.toString() === session.user.id;
    const canManageMessages = await hasPermission(membership, "manageMessages");

    if (!isAuthor && !canManageMessages) {
      return res.status(403).json({ message: "You cannot delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    await pusherServer.trigger(
      `channel-${message.channelId}`,
      "message:delete",
      { messageId }
    );

    return res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.error("DELETE_MESSAGE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

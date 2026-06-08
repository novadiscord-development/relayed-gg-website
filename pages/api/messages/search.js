import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { channelId, q = "" } = req.query;
    const query = q.trim();

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    if (query.length < 2) {
      return res.status(200).json({ messages: [] });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = await Member.findOne({
      serverId: channel.serverId,
      userId: session.user.id,
    });

    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const messages = await Message.find({
      channelId,
      system: { $ne: true },
      deleted: { $ne: true },
      content: { $regex: query, $options: "i" },
    })
      .populate("authorId", "username avatar image isStaff isAdmin badges")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("SEARCH_MESSAGES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
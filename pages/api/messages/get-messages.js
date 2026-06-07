import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import User from "@/models/User";

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

    const { channelId } = req.query;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const membership = await Member.findOne({
      serverId: channel.serverId,
      userId: session.user.id,
    });

    if (!membership) {
      return res.status(403).json({ message: "You are not in this server" });
    }

    const messages = await Message.find({
      channelId,
      deleted: false,
    })
      .populate("authorId", "username avatar isStaff isAdmin badges")
      .populate({
        path: "replyToId",
        select: "content authorId createdAt deleted",
        populate: {
          path: "authorId",
          select: "username avatar isStaff isAdmin badges",
        },
      })
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("GET_MESSAGES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
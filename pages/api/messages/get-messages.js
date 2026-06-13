import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import { hasChannelPermission } from "@/lib/channelPermissions";

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

    const { channelId, before } = req.query;

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

    if (!(await hasChannelPermission(membership, channel, "viewChannels"))) {
      return res.status(403).json({ message: "You cannot view this channel" });
    }

    const query = {
      channelId,
      deleted: false,
    };

    if (before) {
      query.createdAt = {
        $lt: new Date(before),
      };
    }

    const messages = await Message.find(query)
      .populate("authorId", "username avatar isStaff isAdmin badges")
      .populate({
        path: "replyToId",
        select: "content authorId createdAt deleted",
        populate: {
          path: "authorId",
          select: "username avatar isStaff isAdmin badges",
        },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const orderedMessages = messages.reverse();

    return res.status(200).json({
      messages: orderedMessages,
      hasMore: messages.length === 50,
      oldestMessageAt: orderedMessages[0]?.createdAt || null,
    });
  } catch (error) {
    console.error("GET_MESSAGES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

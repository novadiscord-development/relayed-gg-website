import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { channelId, parentId = null, position = 0 } = req.body;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID required" });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const membership = await Member.findOne({
      serverId: channel.serverId,
      userId: session.user.id,
    });

    if (!membership || !["owner", "admin", "moderator"].includes(membership.role)) {
      return res.status(403).json({ message: "No permission" });
    }

    if (channel.type === "category") {
      return res.status(400).json({ message: "Categories cannot be moved into categories yet" });
    }

    channel.parentId = parentId || null;
    channel.position = position;

    await channel.save();

    return res.status(200).json({ channel });
  } catch (error) {
    console.error("MOVE_CHANNEL_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
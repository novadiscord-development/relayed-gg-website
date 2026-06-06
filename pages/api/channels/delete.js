import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { channelId } = req.body;

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

    if (
      !membership ||
      !["owner", "admin", "moderator"].includes(membership.role)
    ) {
      return res.status(403).json({ message: "No permission" });
    }

    if (channel.type === "category") {
      await Channel.updateMany(
        { parentId: channel._id },
        { $set: { parentId: null } }
      );

      await Channel.findByIdAndDelete(channel._id);

      return res.status(200).json({
        success: true,
        detachedChildren: true,
      });
    }

    await Message.deleteMany({ channelId: channel._id });
    await Channel.findByIdAndDelete(channel._id);

    return res.status(200).json({
      success: true,
      detachedChildren: false,
    });
  } catch (error) {
    console.error("DELETE_CHANNEL_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await connectDB();

    const { serverId, name, type = "text", parentId = null } = req.body;

    if (!serverId || !name) {
      return res.status(400).json({
        message: "Server ID and channel name are required",
      });
    }

    if (!["text", "voice", "category"].includes(type)) {
      return res.status(400).json({
        message: "Invalid channel type",
      });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this server",
      });
    }

    if (!["owner", "admin", "moderator"].includes(membership.role)) {
      return res.status(403).json({
        message: "You do not have permission to create channels",
      });
    }

    const channelCount = await Channel.countDocuments({ serverId });

    const channel = await Channel.create({
      serverId,
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      type,
      parentId,
      position: channelCount,
    });

    return res.status(201).json({
      channel,
    });
  } catch (error) {
    console.error("CREATE_CHANNEL_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
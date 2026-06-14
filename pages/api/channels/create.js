import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import generateSnowflake from "@/lib/generateSnowflake";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import { hasPermission } from "@/lib/permissions";

function cleanChannelName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 40);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
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

    const cleanName = cleanChannelName(name);

    if (!cleanName) {
      return res.status(400).json({
        message: "Channel name is invalid",
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

    if (!(await hasPermission(membership, "manageChannels"))) {
      return res.status(403).json({
        message: "You do not have permission to create channels",
      });
    }

    if (parentId) {
      const parentCategory = await Channel.findOne({
        _id: parentId,
        serverId,
        type: "category",
      });

      if (!parentCategory) {
        return res.status(400).json({
          message: "Parent category not found",
        });
      }
    }

    const channelCount = await Channel.countDocuments({ serverId });

    const channel = await Channel.create({
      publicId: generateSnowflake(),
      serverId,
      name: cleanName,
      type,
      parentId: type === "category" ? null : parentId,
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

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import { hasPermission } from "@/lib/permissions";

function cleanPermissionObject(value = {}) {
  return {
    viewChannels: Boolean(value.viewChannels),
    sendMessages: Boolean(value.sendMessages),
    attachFiles: Boolean(value.attachFiles),
    manageMessages: Boolean(value.manageMessages),
  };
}

function cleanOverwrites(overwrites = []) {
  if (!Array.isArray(overwrites)) return [];

  return overwrites
    .filter((overwrite) => ["everyone", "role", "member"].includes(overwrite?.targetType))
    .map((overwrite) => ({
      targetType: overwrite.targetType,
      targetId: overwrite.targetType === "everyone" ? null : overwrite.targetId || null,
      allow: cleanPermissionObject(overwrite.allow),
      deny: cleanPermissionObject(overwrite.deny),
    }));
}

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { channelId, overwrites = [] } = req.body;
    if (!channelId) return res.status(400).json({ message: "Channel ID is required" });

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const membership = await Member.findOne({
      serverId: channel.serverId,
      userId: session.user.id,
    });

    if (!membership || !(await hasPermission(membership, "manageChannels"))) {
      return res.status(403).json({ message: "No permission" });
    }

    channel.permissionOverwrites = cleanOverwrites(overwrites);
    await channel.save();

    return res.status(200).json({
      channel,
      overwrites: channel.permissionOverwrites || [],
    });
  } catch (error) {
    console.error("UPDATE_CHANNEL_PERMISSIONS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

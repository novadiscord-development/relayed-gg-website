import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import { hasChannelPermission } from "@/lib/channelPermissions";

export default async function handler(req, res) {
  if (req.method !== "GET") {
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

    const { serverId } = req.query;

    if (!serverId) {
      return res.status(400).json({
        message: "Server ID is required",
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

    const channels = await Channel.find({
      serverId,
    }).sort({
      position: 1,
      createdAt: 1,
    });

    const visibleChecks = await Promise.all(
      channels.map(async (channel) => ({
        channel,
        canView: await hasChannelPermission(membership, channel, "viewChannels"),
      }))
    );

    const directlyVisibleChannels = visibleChecks
      .filter((item) => item.canView)
      .map((item) => item.channel);

    const directlyVisibleIds = new Set(
      directlyVisibleChannels.map((channel) => channel._id.toString())
    );

    const visibleParentIds = new Set(
      directlyVisibleChannels
        .filter((channel) => channel.parentId)
        .map((channel) => channel.parentId.toString())
    );

    const visibleChannels = channels.filter((channel) => {
      const channelId = channel._id.toString();

      if (directlyVisibleIds.has(channelId)) return true;

      return channel.type === "category" && visibleParentIds.has(channelId);
    });

    const firstTextChannel = visibleChannels.find(
      (channel) => channel.type === "text"
    );

    return res.status(200).json({
      channels: visibleChannels,
      firstTextChannel: firstTextChannel || null,
    });
  } catch (error) {
    console.error("GET_CHANNELS_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

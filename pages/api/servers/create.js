import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import generateSnowflake from "@/lib/generateSnowflake";

import Server from "@/models/Server";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import ensureEveryoneRole from "@/lib/ensureEveryoneRole";

function cleanTags(tags = []) {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(
      tags
        .map((tag) =>
          String(tag || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_ ]/g, "")
            .slice(0, 24)
        )
        .filter(Boolean)
    ),
  ].slice(0, 5);
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

    const {
      name,
      visibility = "private",
      description = "",
      tags = [],
    } = req.body;

    const cleanName = String(name || "").trim();

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Server name must be at least 2 characters",
      });
    }

    if (cleanName.length > 80) {
      return res.status(400).json({
        message: "Server name must be 80 characters or less",
      });
    }

    const cleanDescription = String(description || "").trim().slice(0, 500);
    const isPublic = visibility === "public";

    const server = await Server.create({
      publicId: generateSnowflake(),
      name: cleanName,
      ownerId: session.user.id,
      description: cleanDescription,
      visibility: isPublic ? "public" : "private",
      publicEnabled: isPublic,
      tags: cleanTags(tags),
      memberCount: 1,
      discoverableAt: isPublic ? new Date() : null,
    });

    await ensureEveryoneRole(server._id);

    await Member.create({
      serverId: server.publicId,
      userId: session.user.id,
      role: "owner",
      roles: [],
    });

    const textCategory = await Channel.create({
      publicId: generateSnowflake(),
      serverId: server.publicId,
      name: "text-channels",
      type: "category",
      parentId: null,
      position: 0,
    });

    const voiceCategory = await Channel.create({
      publicId: generateSnowflake(),
      serverId: server.publicId,
      name: "voice-channels",
      type: "category",
      parentId: null,
      position: 1,
    });

    const generalTextChannel = await Channel.create({
      publicId: generateSnowflake(),
      serverId: server.publicId,
      name: "general",
      type: "text",
      parentId: textCategory._id,
      position: 2,
    });

    const generalVoiceChannel = await Channel.create({
      publicId: generateSnowflake(),
      serverId: server.publicId,
      name: "General",
      type: "voice",
      parentId: voiceCategory._id,
      position: 3,
    });

    return res.status(201).json({
      success: true,
      server,
      channels: {
        textCategory,
        voiceCategory,
        generalTextChannel,
        generalVoiceChannel,
      },
      channel: generalTextChannel,
    });
  } catch (error) {
    console.error("CREATE_SERVER_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

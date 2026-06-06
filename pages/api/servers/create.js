import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";

import Server from "@/models/Server";
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

    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Server name must be at least 2 characters",
      });
    }

    const server = await Server.create({
      name: name.trim(),
      ownerId: session.user.id,
    });

    await Member.create({
      serverId: server._id,
      userId: session.user.id,
      role: "owner",
    });

    const textCategory = await Channel.create({
      serverId: server._id,
      name: "text-channels",
      type: "category",
      parentId: null,
      position: 0,
    });

    const voiceCategory = await Channel.create({
      serverId: server._id,
      name: "voice-channels",
      type: "category",
      parentId: null,
      position: 1,
    });

    const generalTextChannel = await Channel.create({
      serverId: server._id,
      name: "general",
      type: "text",
      parentId: textCategory._id,
      position: 2,
    });

    const generalVoiceChannel = await Channel.create({
      serverId: server._id,
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
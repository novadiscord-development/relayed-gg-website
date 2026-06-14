import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import ServerBan from "@/models/ServerBan";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const server = await Server.findOne({
      _id: serverId,
      visibility: "public",
      publicEnabled: true,
    });

    if (!server) {
      return res.status(404).json({ message: "Public server not found" });
    }

    const ban = await ServerBan.findOne({
      serverId,
      userId: session.user.id,
    });

    if (ban) {
      return res.status(403).json({ message: "You are banned from this server" });
    }

    let membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership) {
      membership = await Member.create({
        serverId,
        userId: session.user.id,
        role: "member",
        roles: [],
      });

      await Server.updateOne(
        { _id: serverId },
        { $inc: { memberCount: 1 } }
      );
    }

    const firstTextChannel = await Channel.findOne({
      serverId,
      type: "text",
    }).sort({
      position: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      server,
      membership,
      channel: firstTextChannel || null,
    });
  } catch (error) {
    console.error("JOIN_PUBLIC_SERVER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

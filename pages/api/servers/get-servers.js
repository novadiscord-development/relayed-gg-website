import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Server from "@/models/Server";

export default async function handler(req, res) {
  if (req.method !== "GET") {
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

    const memberships = await Member.find({
      userId: session.user.id,
    }).select("serverId role");

    const serverIds = memberships.map((member) => member.serverId);

    const servers = await Server.find({
      _id: { $in: serverIds },
    }).sort({ createdAt: 1 });

    const serversWithMembership = servers.map((server) => {
      const membership = memberships.find(
        (member) => member.serverId.toString() === server._id.toString()
      );

      return {
        _id: server._id,
        name: server.name,
        icon: server.icon,
        ownerId: server.ownerId,
        role: membership?.role || "member",
        createdAt: server.createdAt,
      };
    });

    return res.status(200).json({
      servers: serversWithMembership,
    });
  } catch (error) {
    console.error("GET_SERVERS_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";

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

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        message: "Server not found",
      });
    }

    return res.status(200).json({
      server: {
        _id: server._id,
        name: server.name,
        icon: server.icon,
        ownerId: server.ownerId,
        createdAt: server.createdAt,
      },

      membership: {
        _id: membership._id,
        role: membership.role,
        isOwner: membership.role === "owner",
        canManageServer: ["owner", "admin", "moderator"].includes(
          membership.role
        ),
      },
    });
  } catch (error) {
    console.error("GET_SERVER_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
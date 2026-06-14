import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";
import { getMemberPermissions } from "@/lib/permissions";

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
    }).populate({
      path: "roles",
      match: { isEveryone: { $ne: true } },
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

    const permissions = await getMemberPermissions(membership);

    return res.status(200).json({
      server: {
        _id: server._id,
        name: server.name,
        icon: server.icon,
        banner: server.banner,
        description: server.description,
        ownerId: server.ownerId,
        visibility: server.visibility || "private",
        publicEnabled: Boolean(server.publicEnabled),
        tags: server.tags || [],
        memberCount: server.memberCount || 0,
        discoverableAt: server.discoverableAt || null,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
      },

      membership: {
        _id: membership._id,
        role: membership.role,
        roles: membership.roles || [],
        permissions,
        isOwner: membership.role === "owner",
        canManageServer: Boolean(permissions.manageServer),
        canManageChannels: Boolean(permissions.manageChannels),
        canManageRoles: Boolean(permissions.manageRoles),
      },
    });
  } catch (error) {
    console.error("GET_SERVER_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

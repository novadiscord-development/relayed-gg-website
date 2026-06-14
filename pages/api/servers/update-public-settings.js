import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";
import AuditLog from "@/models/AuditLog";
import { hasPermission } from "@/lib/permissions";

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
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId, visibility = "private", tags = [] } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID required" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership || !(await hasPermission(membership, "manageServer"))) {
      return res.status(403).json({ message: "No permission" });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const isPublic = visibility === "public";

    server.visibility = isPublic ? "public" : "private";
    server.publicEnabled = isPublic;
    server.tags = cleanTags(tags);
    server.discoverableAt = isPublic
      ? server.discoverableAt || new Date()
      : null;

    await server.save();

    await AuditLog.create({
      serverId,
      action: "server_update",
      actorId: session.user.id,
      metadata: {
        visibility: server.visibility,
        publicEnabled: server.publicEnabled,
        tags: server.tags,
      },
    });

    return res.status(200).json({ server });
  } catch (error) {
    console.error("UPDATE_PUBLIC_SERVER_SETTINGS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

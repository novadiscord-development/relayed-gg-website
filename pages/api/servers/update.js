import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";
import AuditLog from "@/models/AuditLog";
import { hasPermission } from "@/lib/permissions";

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

    const { serverId, name, icon, banner, description } = req.body;

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

    const metadata = {};

    if (typeof name === "string") {
      const cleanName = name.trim();

      if (cleanName.length < 2 || cleanName.length > 80) {
        return res.status(400).json({
          message: "Server name must be between 2 and 80 characters",
        });
      }

      metadata.previousName = server.name;
      metadata.name = cleanName;
      server.name = cleanName;
    }

    if (typeof icon === "string") {
      const cleanIcon = icon.trim();
      metadata.iconChanged = server.icon !== cleanIcon;
      server.icon = cleanIcon;
    }

    if (typeof banner === "string") {
      const cleanBanner = banner.trim();
      metadata.bannerChanged = server.banner !== cleanBanner;
      server.banner = cleanBanner;
    }

    if (typeof description === "string") {
      const cleanDescription = description.trim();

      if (cleanDescription.length > 500) {
        return res.status(400).json({
          message: "Server description must be 500 characters or less",
        });
      }

      metadata.description = cleanDescription;
      server.description = cleanDescription;
    }

    await server.save();

    await AuditLog.create({
      serverId,
      action: "server_update",
      actorId: session.user.id,
      metadata,
    });

    return res.status(200).json({ server });
  } catch (error) {
    console.error("UPDATE_SERVER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

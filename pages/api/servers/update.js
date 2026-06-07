import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, name, icon, description } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID required" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "No permission" });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    if (name?.trim()) server.name = name.trim();
    if (icon !== undefined) server.icon = icon;
    if (description !== undefined) server.description = description;

    await server.save();

    return res.status(200).json({ server });
  } catch (error) {
    console.error("UPDATE_SERVER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
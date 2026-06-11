import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import AuditLog from "@/models/AuditLog";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId } = req.query;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership || !["owner", "admin", "moderator"].includes(membership.role)) {
      return res.status(403).json({ message: "No permission" });
    }

    const logs = await AuditLog.find({ serverId })
      .populate("actorId", "username avatar image")
      .populate("targetUserId", "username avatar image")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("GET_AUDIT_LOGS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
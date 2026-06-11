import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import ServerBan from "@/models/ServerBan";
import AuditLog from "@/models/AuditLog";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, banId } = req.body;

    if (!serverId || !banId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
      return res.status(403).json({ message: "No permission" });
    }

    const ban = await ServerBan.findOne({
      _id: banId,
      serverId,
    });

    if (!ban) {
      return res.status(404).json({ message: "Ban not found" });
    }

    await ServerBan.findByIdAndDelete(ban._id);

    await AuditLog.create({
      serverId,
      action: "member_unban",
      actorId: session.user.id,
      targetUserId: targetMember.userId,
    });

    return res.status(200).json({
      success: true,
      banId,
    });
  } catch (error) {
    console.error("UNBAN_MEMBER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import ServerBan from "@/models/ServerBan";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId } = req.query;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const currentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
      return res.status(403).json({ message: "No permission" });
    }

    const bans = await ServerBan.find({ serverId })
      .populate("userId", "username avatar isStaff isAdmin badges")
      .populate("bannedBy", "username avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      bans,
    });
  } catch (error) {
    console.error("GET_BANS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, memberId } = req.body;

    if (!serverId || !memberId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
      return res.status(403).json({ message: "No permission" });
    }

    const targetMember = await Member.findOne({
      _id: memberId,
      serverId,
    });

    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({ message: "You cannot kick the owner" });
    }

    if (currentMember.role === "admin" && targetMember.role !== "member") {
      return res.status(403).json({
        message: "Admins can only kick regular members",
      });
    }

    await Member.findByIdAndDelete(targetMember._id);

    return res.status(200).json({
      success: true,
      memberId,
    });
  } catch (error) {
    console.error("KICK_MEMBER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
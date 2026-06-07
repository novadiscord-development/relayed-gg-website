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

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership) {
      return res.status(404).json({ message: "You are not in this server" });
    }

    if (membership.role === "owner") {
      return res.status(403).json({
        message: "Owners cannot leave their own server",
      });
    }

    await Member.findByIdAndDelete(membership._id);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("LEAVE_SERVER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
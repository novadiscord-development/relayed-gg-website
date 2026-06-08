import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Presence from "@/models/Presence";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select(
      "username name avatar image bio isStaff isAdmin badges createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const presence = await Presence.findOne({ userId }).select(
      "status customStatus lastSeenAt lastActivityAt"
    );

    return res.status(200).json({
      user,
      presence: presence || {
        status: "offline",
        customStatus: "",
      },
    });
  } catch (error) {
    console.error("GET_USER_PROFILE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
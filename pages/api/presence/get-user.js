import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
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

    const presence = await Presence.findOne({ userId });

    return res.status(200).json({
      status: presence?.status || "offline",
      customStatus: presence?.customStatus || "",
      lastSeenAt: presence?.lastSeenAt || null,
      lastActivityAt: presence?.lastActivityAt || null,
    });
  } catch (error) {
    console.error("GET_USER_PRESENCE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
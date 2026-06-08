import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Presence from "@/models/Presence";

const ONLINE_WINDOW_MS = 45 * 1000;

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

    const customStatus = presence?.customStatus || "";
    const lastSeenAt = presence?.lastSeenAt || null;
    const lastActivityAt = presence?.lastActivityAt || null;

    if (!presence || !lastSeenAt) {
      return res.status(200).json({
        status: "offline",
        customStatus,
        lastSeenAt,
        lastActivityAt,
      });
    }

    const lastSeenTime = new Date(lastSeenAt).getTime();
    const isOnline = Date.now() - lastSeenTime <= ONLINE_WINDOW_MS;

    return res.status(200).json({
      status: isOnline ? presence.status || "online" : "offline",
      customStatus,
      lastSeenAt,
      lastActivityAt,
    });
  } catch (error) {
    console.error("GET_USER_PRESENCE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
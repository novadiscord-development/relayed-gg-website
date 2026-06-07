import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

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

    const { serverId, channelId } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const query = {
      userId: session.user.id,
      serverId,
    };

    if (channelId) {
      query.channelId = channelId;
    }

    await Notification.deleteMany(query);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("READ_NOTIFICATIONS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
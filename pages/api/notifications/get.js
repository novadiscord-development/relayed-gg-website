import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import UserNotification from "@/models/UserNotification";

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

    const notifications = await UserNotification.find({
      userId: session.user.id,
    })
      .populate("actorId", "username avatar image")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await UserNotification.countDocuments({
      userId: session.user.id,
      read: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
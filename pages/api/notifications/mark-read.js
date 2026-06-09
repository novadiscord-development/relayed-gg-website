import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import UserNotification from "@/models/UserNotification";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { notificationId = null, all = false } = req.body;

    const query = {
      userId: session.user.id,
    };

    if (!all) {
      if (!notificationId) {
        return res.status(400).json({ message: "Notification ID is required" });
      }

      query._id = notificationId;
    }

    await UserNotification.updateMany(query, {
      $set: {
        read: true,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("MARK_USER_NOTIFICATION_READ_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
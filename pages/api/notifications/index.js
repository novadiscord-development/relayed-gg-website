import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

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

    const notifications = await Notification.find({
      userId: session.user.id,
    }).lean();

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
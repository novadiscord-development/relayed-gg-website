import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Friend from "@/models/Friend";
import FriendRequest from "@/models/FriendRequest";

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

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const currentUserId = session.user.id.toString();
    const targetUserId = userId.toString();

    if (currentUserId === targetUserId) {
      return res.status(200).json({
        status: "self",
        requestId: null,
      });
    }

    const friendship = await Friend.findOne({
      $or: [
        { userId: currentUserId, friendId: targetUserId },
        { userId: targetUserId, friendId: currentUserId },
      ],
    });

    if (friendship) {
      return res.status(200).json({
        status: "friends",
        requestId: null,
      });
    }

    const outgoing = await FriendRequest.findOne({
      fromUserId: currentUserId,
      toUserId: targetUserId,
      status: "pending",
    });

    if (outgoing) {
      return res.status(200).json({
        status: "outgoing",
        requestId: outgoing._id,
      });
    }

    const incoming = await FriendRequest.findOne({
      fromUserId: targetUserId,
      toUserId: currentUserId,
      status: "pending",
    });

    if (incoming) {
      return res.status(200).json({
        status: "incoming",
        requestId: incoming._id,
      });
    }

    return res.status(200).json({
      status: "none",
      requestId: null,
    });
  } catch (error) {
    console.error("FRIEND_STATUS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Friend from "@/models/Friend";
import FriendRequest from "@/models/FriendRequest";

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

    const { userId } = req.body;
    const currentUserId = session.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const targetUser = await User.findById(userId).select("_id");

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFriend = await Friend.findOne({
      $or: [
        { userA: currentUserId, userB: userId },
        { userA: userId, userB: currentUserId },
      ],
    });

    if (existingFriend) {
      return res.status(400).json({ message: "You are already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { fromUserId: currentUserId, toUserId: userId, status: "pending" },
        { fromUserId: userId, toUserId: currentUserId, status: "pending" },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const request = await FriendRequest.create({
      fromUserId: currentUserId,
      toUserId: userId,
      status: "pending",
    });

    return res.status(201).json({ request });
  } catch (error) {
    console.error("SEND_FRIEND_REQUEST_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

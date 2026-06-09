import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Friend from "@/models/Friend";
import FriendRequest from "@/models/FriendRequest";
import BlockedUser from "@/models/blockedUser";

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
        blocked: false,
        blockedBy: false,
      });
    }

    const blocked = await BlockedUser.findOne({
      blockerId: currentUserId,
      blockedId: targetUserId,
    });

    if (blocked) {
      return res.status(200).json({
        status: "blocked",
        requestId: null,
        blocked: true,
        blockedBy: false,
      });
    }

    const blockedBy = await BlockedUser.findOne({
      blockerId: targetUserId,
      blockedId: currentUserId,
    });

    if (blockedBy) {
      return res.status(200).json({
        status: "blocked_by",
        requestId: null,
        blocked: false,
        blockedBy: true,
      });
    }

    const friendship = await Friend.findOne({
      $or: [
        { userA: currentUserId, userB: targetUserId },
        { userA: targetUserId, userB: currentUserId },
      ],
    });

    if (friendship) {
      return res.status(200).json({
        status: "friends",
        requestId: null,
        blocked: false,
        blockedBy: false,
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
        blocked: false,
        blockedBy: false,
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
        blocked: false,
        blockedBy: false,
      });
    }

    return res.status(200).json({
      status: "none",
      requestId: null,
      blocked: false,
      blockedBy: false,
    });
  } catch (error) {
    console.error("FRIEND_STATUS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
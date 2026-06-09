import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import BlockedUser from "@/models/blockedUser";
import Friend from "@/models/Friend";
import FriendRequest from "@/models/FriendRequest";

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

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const currentUserId = session.user.id.toString();
    const targetUserId = userId.toString();

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    await BlockedUser.findOneAndUpdate(
      {
        blockerId: currentUserId,
        blockedId: targetUserId,
      },
      {
        $set: {
          blockerId: currentUserId,
          blockedId: targetUserId,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    await Friend.deleteOne({
      $or: [
        { userA: currentUserId, userB: targetUserId },
        { userA: targetUserId, userB: currentUserId },
      ],
    });

    await FriendRequest.deleteMany({
      $or: [
        { fromUserId: currentUserId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: currentUserId },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("BLOCK_USER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
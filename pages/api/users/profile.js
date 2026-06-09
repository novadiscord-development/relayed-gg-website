import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Presence from "@/models/Presence";
import Friend from "@/models/Friend";
import Member from "@/models/Member";
import Server from "@/models/Server";

function normalizeId(value) {
  return (value?._id || value || "").toString();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    await connectDB();

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select(
      "username avatar image banner bio pronouns customStatus isStaff isAdmin badges createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const presence = await Presence.findOne({ userId }).lean();

    let mutualFriends = [];
    let mutualServers = [];

    if (session?.user?.id && session.user.id.toString() !== userId.toString()) {
      const currentUserId = session.user.id.toString();
      const targetUserId = userId.toString();

      const currentFriendships = await Friend.find({
        $or: [{ userA: currentUserId }, { userB: currentUserId }],
      }).lean();

      const targetFriendships = await Friend.find({
        $or: [{ userA: targetUserId }, { userB: targetUserId }],
      }).lean();

      const currentFriendIds = currentFriendships.map((friendship) =>
        normalizeId(friendship.userA) === currentUserId
          ? normalizeId(friendship.userB)
          : normalizeId(friendship.userA)
      );

      const targetFriendIds = targetFriendships.map((friendship) =>
        normalizeId(friendship.userA) === targetUserId
          ? normalizeId(friendship.userB)
          : normalizeId(friendship.userA)
      );

      const mutualFriendIds = currentFriendIds.filter((id) =>
        targetFriendIds.includes(id)
      );

      mutualFriends = await User.find({
        _id: { $in: mutualFriendIds },
      })
        .select("username avatar image isStaff isAdmin badges")
        .limit(12)
        .lean();

      const currentMemberships = await Member.find({
        userId: currentUserId,
      }).lean();

      const targetMemberships = await Member.find({
        userId: targetUserId,
      }).lean();

      const currentServerIds = currentMemberships.map((member) =>
        normalizeId(member.serverId)
      );

      const targetServerIds = targetMemberships.map((member) =>
        normalizeId(member.serverId)
      );

      const mutualServerIds = currentServerIds.filter((id) =>
        targetServerIds.includes(id)
      );

      mutualServers = await Server.find({
        _id: { $in: mutualServerIds },
      })
        .select("name icon image")
        .limit(12)
        .lean();
    }

    return res.status(200).json({
      user,
      presence: presence || null,
      mutualFriends,
      mutualServers,
    });
  } catch (error) {
    console.error("GET_USER_PROFILE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
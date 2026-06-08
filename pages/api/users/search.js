import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
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

    const { q = "" } = req.query;
    const search = q.trim();

    if (search.length < 2) {
      return res.status(200).json({ users: [] });
    }

    const users = await User.find({
      _id: { $ne: session.user.id },
      $or: [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ],
    })
      .select("username name avatar image isStaff isAdmin badges")
      .limit(10)
      .lean();

    const userIds = users.map((user) => user._id);

    const friends = await Friend.find({
      $or: [
        { userA: session.user.id, userB: { $in: userIds } },
        { userB: session.user.id, userA: { $in: userIds } },
      ],
    }).lean();

    const requests = await FriendRequest.find({
      status: "pending",
      $or: [
        { fromUserId: session.user.id, toUserId: { $in: userIds } },
        { toUserId: session.user.id, fromUserId: { $in: userIds } },
      ],
    }).lean();

    function sameId(a, b) {
      return a?.toString() === b?.toString();
    }

    function getRelationship(userId) {
      const isFriend = friends.some(
        (friend) =>
          sameId(friend.userA, userId) || sameId(friend.userB, userId)
      );

      if (isFriend) return "friend";

      const request = requests.find(
        (request) =>
          sameId(request.fromUserId, userId) ||
          sameId(request.toUserId, userId)
      );

      if (!request) return "none";

      return sameId(request.fromUserId, session.user.id)
        ? "outgoing"
        : "incoming";
    }

    return res.status(200).json({
      users: users.map((user) => ({
        ...user,
        relationship: getRelationship(user._id),
      })),
    });
  } catch (error) {
    console.error("SEARCH_USERS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Friend from "@/models/Friend";

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

    const friendships = await Friend.find({
      $or: [
        { userA: session.user.id },
        { userB: session.user.id },
      ],
    })
      .populate(
        "userA userB",
        "username avatar image isStaff isAdmin badges"
      )
      .sort({ updatedAt: -1 });

    const friends = friendships.map((friendship) => {
      const friend =
        friendship.userA._id.toString() === session.user.id.toString()
          ? friendship.userB
          : friendship.userA;

      return {
        friendshipId: friendship._id,
        ...friend.toObject(),
      };
    });

    return res.status(200).json({
      friends,
    });
  } catch (error) {
    console.error("GET_FRIENDS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
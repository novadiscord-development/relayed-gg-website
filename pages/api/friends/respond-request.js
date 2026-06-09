import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Friend from "@/models/Friend";
import FriendRequest from "@/models/FriendRequest";
import UserNotification from "@/models/UserNotification";
import { pusherServer } from "@/lib/pusher";

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

    const { requestId, action } = req.body;

    if (!requestId || !["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.toUserId.toString() !== session.user.id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already handled" });
    }

    request.status = action === "accept" ? "accepted" : "declined";
    await request.save();

    if (action === "accept") {
      await Friend.findOneAndUpdate(
        {
          userA: request.fromUserId,
          userB: request.toUserId,
        },
        {
          $setOnInsert: {
            userA: request.fromUserId,
            userB: request.toUserId,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );

      const actorName =
        session.user.username || session.user.name || "Someone";

      const notification = await UserNotification.create({
        userId: request.fromUserId,
        type: "friend_accept",
        actorId: session.user.id,
        title: "Friend request accepted",
        message: `${actorName} accepted your friend request.`,
        read: false,
      });

      await pusherServer.trigger(
        `user-${request.fromUserId}`,
        "notification:new",
        { notification }
      );
    }

    return res.status(200).json({ request });
  } catch (error) {
    console.error("RESPOND_FRIEND_REQUEST_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
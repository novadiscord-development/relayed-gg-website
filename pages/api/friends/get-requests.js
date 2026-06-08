import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
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

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    const incoming = await FriendRequest.find({
      toUserId: currentUserId,
      status: "pending",
    })
      .populate("fromUserId", "username avatar image isStaff isAdmin badges")
      .sort({ createdAt: -1 })
      .lean();

    const outgoing = await FriendRequest.find({
      fromUserId: currentUserId,
      status: "pending",
    })
      .populate("toUserId", "username avatar image isStaff isAdmin badges")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      incoming,
      outgoing,
      incomingCount: incoming.length,
      outgoingCount: outgoing.length,
    });
  } catch (error) {
    console.error("GET_FRIEND_REQUESTS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
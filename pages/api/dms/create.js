import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Conversation from "@/models/Conversation";

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
      return res.status(400).json({ message: "You cannot DM yourself" });
    }

    const targetUser = await User.findById(userId).select("_id");

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, userId],
        $size: 2,
      },
    }).populate("participants", "username avatar image isStaff isAdmin badges");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, userId],
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "username avatar image isStaff isAdmin badges"
      );
    }

    return res.status(200).json({ conversation });
  } catch (error) {
    console.error("CREATE_DM_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
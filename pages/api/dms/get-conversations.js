import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

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

    const conversations = await Conversation.find({
      participants: session.user.id,
    })
      .populate("participants", "username avatar image isStaff isAdmin badges")
      .populate({
        path: "lastMessageId",
        select: "content authorId createdAt deleted",
        populate: {
          path: "authorId",
          select: "username avatar image",
        },
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("GET_DM_CONVERSATIONS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      `
      username
      email
      avatar
      banner
      bio
      pronouns
      customStatus
      isStaff
      isAdmin
      badges
      settings
      createdAt
      `
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("GET_CURRENT_USER_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
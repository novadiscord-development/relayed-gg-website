import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Role from "@/models/Role";
import ensureEveryoneRole from "@/lib/ensureEveryoneRole";

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

    const { serverId } = req.query;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "Not a member of this server",
      });
    }

    await ensureEveryoneRole(serverId);

    const roles = await Role.find({ serverId })
      .sort({
        isEveryone: -1,
        position: -1,
      })
      .lean();

    return res.status(200).json({ roles });
  } catch (error) {
    console.error("GET_ROLES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
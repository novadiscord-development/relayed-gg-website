import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Presence from "@/models/Presence";

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

    const { serverId } = req.query;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const currentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!currentMember) {
      return res.status(403).json({ message: "You are not in this server" });
    }

    const members = await Member.find({ serverId }).select("userId");
    const userIds = members.map((member) => member.userId);

    const presences = await Presence.find({
      userId: { $in: userIds },
    }).lean();

    const now = Date.now();

    const presenceMap = {};

    presences.forEach((presence) => {
      const userId = presence.userId.toString();

      const lastSeenAt = presence.lastSeenAt
        ? new Date(presence.lastSeenAt).getTime()
        : 0;

      const secondsSinceSeen = (now - lastSeenAt) / 1000;

      let status = presence.status || "offline";

      if (secondsSinceSeen > 90) {
        status = "offline";
      } 

      presenceMap[userId] = {
        userId,
        status,
        customStatus: presence.customStatus || "",
        lastSeenAt: presence.lastSeenAt,
        lastActivityAt: presence.lastActivityAt,
      };
    });

    userIds.forEach((userId) => {
      const key = userId.toString();

      if (!presenceMap[key]) {
        presenceMap[key] = {
          userId: key,
          status: "offline",
          customStatus: presence.customStatus || "",
          lastSeenAt: null,
          lastActivityAt: null,
        };
      }
    });

    return res.status(200).json({
      presences: presenceMap,
    });
  } catch (error) {
    console.error("GET_PRESENCE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Presence from "@/models/Presence";

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

    const { idle = false } = req.body;
    const now = new Date();

    const existingPresence = await Presence.findOne({
      userId: session.user.id,
    });

    const manualDnd = existingPresence?.status === "dnd";

    const nextStatus = manualDnd ? "dnd" : idle ? "idle" : "online";

    const update = {
      status: nextStatus,
      lastSeenAt: now,
    };

    if (!idle) {
      update.lastActivityAt = now;
    }

    const presence = await Presence.findOneAndUpdate(
      {
        userId: session.user.id,
      },
      {
        $set: update,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      presence,
    });
  } catch (error) {
    console.error("PRESENCE_HEARTBEAT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
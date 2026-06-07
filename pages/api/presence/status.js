import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Presence from "@/models/Presence";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

 const { status, customStatus = "" } = req.body;

if (!["online", "idle", "dnd"].includes(status)) {
  return res.status(400).json({ message: "Invalid status" });
}

const presence = await Presence.findOneAndUpdate(
  { userId: session.user.id },
  {
    $set: {
      status,
      customStatus: customStatus.trim().slice(0, 80),
      lastSeenAt: new Date(),
      lastActivityAt: new Date(),
    },
  },
  {
    upsert: true,
    returnDocument: "after",
    setDefaultsOnInsert: true,
  }
);

    return res.status(200).json({ success: true, presence });
  } catch (error) {
    console.error("UPDATE_STATUS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
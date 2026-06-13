import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import { hasPermission } from "@/lib/permissions";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId, channels } = req.body;

    if (!serverId || !Array.isArray(channels)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (!membership || !(await hasPermission(membership, "manageChannels"))) {
      return res.status(403).json({ message: "No permission" });
    }

    await Promise.all(
      channels.map((channel, index) =>
        Channel.updateOne(
          {
            _id: channel._id,
            serverId,
          },
          {
            $set: {
              parentId: channel.parentId || null,
              position: index,
            },
          }
        )
      )
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("REORDER_CHANNELS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

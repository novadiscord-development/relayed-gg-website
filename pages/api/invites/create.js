import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Invite from "@/models/Invite";

function createInviteCode() {
  return crypto.randomBytes(5).toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, maxUses = null, expiresAt = null } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const membership = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    if (
      !membership ||
      !["owner", "admin", "moderator"].includes(membership.role)
    ) {
      return res.status(403).json({ message: "No permission" });
    }

    let code = createInviteCode();

    while (await Invite.findOne({ code })) {
      code = createInviteCode();
    }

    const invite = await Invite.create({
      code,
      serverId,
      creatorId: session.user.id,
      maxUses,
      expiresAt,
    });

    return res.status(201).json({
      invite,
      url: `${process.env.NEXTAUTH_URL}/invite/${code}`,
    });
  } catch (error) {
    console.error("CREATE_INVITE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
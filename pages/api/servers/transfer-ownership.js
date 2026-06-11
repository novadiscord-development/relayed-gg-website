import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import AuditLog from "@/models/AuditLog";
import Member from "@/models/Member";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
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

    const { serverId, memberId } = req.body;

    if (!serverId || !memberId) {
      return res.status(400).json({
        message: "Server ID and Member ID are required",
      });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        message: "Server not found",
      });
    }

    const currentOwner = await Member.findOne({
      serverId,
      userId: session.user.id,
      role: "owner",
    });

    if (!currentOwner) {
      return res.status(403).json({
        message: "Only the server owner can transfer ownership",
      });
    }

    const targetMember = await Member.findById(memberId);

    if (!targetMember) {
      return res.status(404).json({
        message: "Target member not found",
      });
    }

    if (targetMember.serverId.toString() !== serverId.toString()) {
      return res.status(400).json({
        message: "Member does not belong to this server",
      });
    }

    currentOwner.role = "admin";
    await currentOwner.save();

    targetMember.role = "owner";
    await targetMember.save();

    server.ownerId = targetMember.userId;
    await server.save();

    const members = await Member.find({
      serverId,
    }).populate(
      "userId",
      "username avatar image isStaff isAdmin badges"
    );

    const refreshedCurrentMember = await Member.findOne({
      serverId,
      userId: session.user.id,
    });

    await AuditLog.create({
      serverId,
      action: "ownership_transfer",
      actorId: session.user.id,
      targetUserId: targetMember.userId,
    });

    return res.status(200).json({
      success: true,
      server,
      currentMember: refreshedCurrentMember,
      members,
    });
  } catch (error) {
    console.error("TRANSFER_SERVER_OWNERSHIP_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
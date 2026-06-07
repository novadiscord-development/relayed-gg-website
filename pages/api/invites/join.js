import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Invite from "@/models/Invite";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import User from "@/models/User";
import { pusherServer } from "@/lib/pusher";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await connectDB();

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Invite code is required",
      });
    }

    const invite = await Invite.findOne({ code });

    if (!invite) {
      return res.status(404).json({
        message: "Invite not found",
      });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(410).json({
        message: "Invite expired",
      });
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return res.status(410).json({
        message: "Invite has reached its maximum uses",
      });
    }

    const existingMember = await Member.findOne({
      serverId: invite.serverId,
      userId: session.user.id,
    });

    if (existingMember) {
      return res.status(200).json({
        alreadyJoined: true,
        serverId: invite.serverId,
      });
    }

    await Member.create({
      serverId: invite.serverId,
      userId: session.user.id,
      role: "member",
    });

    const firstTextChannel = await Channel.findOne({
      serverId: invite.serverId,
      type: "text",
    }).sort({
      position: 1,
      createdAt: 1,
    });

    if (firstTextChannel) {
      const user = await User.findById(session.user.id).select("username");

      let welcomeMessage = await Message.create({
        serverId: invite.serverId,
        channelId: firstTextChannel._id,
        authorId: session.user.id,
        content: `${
          user?.username || "Someone"
        } has brought the pizza, why don't you say hello!`,
        system: true,
      });

      welcomeMessage = await welcomeMessage.populate(
        "authorId",
        "username avatar isStaff isAdmin badges"
      );

      await pusherServer.trigger(
        `channel-${firstTextChannel._id}`,
        "message:new",
        welcomeMessage
      );
    }

    invite.uses += 1;
    await invite.save();

    return res.status(200).json({
      success: true,
      serverId: invite.serverId,
    });
  } catch (error) {
    console.error("JOIN_INVITE_ERROR", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
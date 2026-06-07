import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import { pusherServer } from "@/lib/pusher";

function sanitizeColor(color) {
  if (!color) return "#7c3aed";

  const clean = color.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
    return clean;
  }

  return "#7c3aed";
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

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

    const {
      channelId,
      content = "",
      title = "",
      description = "",
      color = "#7c3aed",
      image = "",
      thumbnail = "",
      footer = "",
      url = "",
    } = req.body;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    if (!title.trim() && !description.trim()) {
      return res.status(400).json({
        message: "Embed needs at least a title or description",
      });
    }

    const channel = await Channel.findById(channelId);

    if (!channel || channel.type !== "text") {
      return res.status(404).json({ message: "Text channel not found" });
    }

    const membership = await Member.findOne({
      serverId: channel.serverId,
      userId: session.user.id,
    });

    if (!membership) {
      return res.status(403).json({ message: "You are not in this server" });
    }

    if (!["owner", "admin", "moderator"].includes(membership.role)) {
      return res.status(403).json({
        message: "Only moderators, admins, and owners can send embeds",
      });
    }

    let message = await Message.create({
      serverId: channel.serverId,
      channelId,
      authorId: session.user.id,
      content: cleanText(content, 2000),
      embeds: [
        {
          type: "custom",
          title: cleanText(title, 256),
          description: cleanText(description, 4096),
          color: sanitizeColor(color),
          image: cleanText(image, 500),
          thumbnail: cleanText(thumbnail, 500),
          footer: cleanText(footer, 2048),
          url: cleanText(url, 500),
        },
      ],
    });

    message = await Message.findById(message._id)
      .populate("authorId", "username avatar isStaff isAdmin badges")
      .populate({
        path: "replyToId",
        select: "content authorId createdAt",
        populate: {
          path: "authorId",
          select: "username avatar isStaff isAdmin badges",
        },
      });

    await pusherServer.trigger(`channel-${channelId}`, "message:new", message);

    const members = await Member.find({
      serverId: channel.serverId,
      userId: { $ne: session.user.id },
    }).select("userId");

    await Promise.all(
      members.map((member) =>
        Notification.findOneAndUpdate(
          {
            userId: member.userId,
            serverId: channel.serverId,
            channelId,
          },
          {
            $set: {
              unread: true,
              lastMessageAt: message.createdAt,
            },
          },
          {
            upsert: true,
            returnDocument: "after",
            setDefaultsOnInsert: true,
          }
        )
      )
    );

    return res.status(201).json({ message });
  } catch (error) {
    console.error("SEND_EMBED_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
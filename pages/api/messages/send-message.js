import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import { pusherServer } from "@/lib/pusher";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function contentMentionsUsername(content, username) {
  if (!content || !username) return false;

  const escaped = escapeRegExp(username);

  return new RegExp(
    `(^|\\s)@${escaped}(?=\\s|$|[.,!?])`,
    "i"
  ).test(content);
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

    const { channelId, content, replyToId = null } = req.body;

    if (!channelId || !content?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: "Message is too long" });
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

    let replyToMessage = null;

    if (replyToId) {
      replyToMessage = await Message.findOne({
        _id: replyToId,
        channelId,
        serverId: channel.serverId,
      });

      if (!replyToMessage) {
        return res.status(404).json({ message: "Reply message not found" });
      }
    }

    let message = await Message.create({
      serverId: channel.serverId,
      channelId,
      authorId: session.user.id,
      replyToId: replyToMessage?._id || null,
      content: content.trim(),
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
    }).populate("userId", "username");

    await Promise.all(
      members.map((member) => {
        const mentioned = contentMentionsUsername(
          content,
          member.userId?.username
        );

        return Notification.findOneAndUpdate(
          {
            userId: member.userId._id,
            serverId: channel.serverId,
            channelId,
          },
          {
            $set: {
              unread: true,
              lastMessageAt: message.createdAt,
            },
            $inc: {
              mentions: mentioned ? 1 : 0,
            },
          },
          {
            upsert: true,
            returnDocument: "after",
          }
        );
      })
    );

    return res.status(201).json({ message });
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
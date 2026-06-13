import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import ServerTimeout from "@/models/ServerTimeout";
import { pusherServer } from "@/lib/pusher";
import { hasPermission } from "@/lib/permissions";

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

function formatRemainingTime(expiresAt) {
  const remainingMs = new Date(expiresAt).getTime() - Date.now();

  if (remainingMs <= 0) return "a few moments";

  const minutes = Math.ceil(remainingMs / 60000);

  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;

  const hours = Math.ceil(minutes / 60);

  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;

  const days = Math.ceil(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

async function sendTimeoutSystemMessage({
  channel,
  channelId,
  username,
  expiresAt,
}) {
  const timeLimit = formatRemainingTime(expiresAt);

  let systemMessage = await Message.create({
    serverId: channel.serverId,
    channelId,
    authorId: null,
    system: true,
    systemBot: true,
    content: `@${username}, you are currently timed out and cannot send messages for the next ${timeLimit}.`,
  });

  systemMessage = await Message.findById(systemMessage._id).lean();

  systemMessage.authorId = {
    username: "Relay",
    avatar: "/botlogo.png",
    image: "/botlogo.png",
  };

  await pusherServer.trigger(
    `channel-${channelId}`,
    "message:new",
    systemMessage
  );

  return systemMessage;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
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
    }).populate("userId", "username");

    if (!membership) {
      return res.status(403).json({ message: "You are not in this server" });
    }

    if (!(await hasPermission(membership, "manageMessages"))) {
      return res.status(403).json({
        message: "You do not have permission to send embeds",
      });
    }

    const timeout = await ServerTimeout.findOne({
      serverId: channel.serverId,
      userId: session.user.id,
    });

    if (timeout) {
      if (timeout.expiresAt <= new Date()) {
        await ServerTimeout.findByIdAndDelete(timeout._id);
      } else {
        const systemMessage = await sendTimeoutSystemMessage({
          channel,
          channelId,
          username:
            membership.userId?.username ||
            session.user.username ||
            session.user.name ||
            "User",
          expiresAt: timeout.expiresAt,
        });

        return res.status(403).json({
          timedOut: true,
          message: "You are currently timed out.",
          systemMessage,
          expiresAt: timeout.expiresAt,
        });
      }
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

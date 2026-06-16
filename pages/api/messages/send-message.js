import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import ServerTimeout from "@/models/ServerTimeout";
import { pusherServer } from "@/lib/pusher";
import { hasChannelPermission } from "@/lib/channelPermissions";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function contentMentionsUsername(content, username) {
  if (!content || !username) return false;

  const escaped = escapeRegExp(username);

  return new RegExp(`(^|\\s)@${escaped}(?=\\s|$|[.,!?])`, "i").test(content);
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

async function updateMessageNotifications({
  serverId,
  channelId,
  senderId,
  cleanContent,
  messageCreatedAt,
}) {
  const members = await Member.find({
    serverId,
    userId: { $ne: senderId },
  })
    .populate("userId", "username")
    .lean();

  if (!members.length) return;

  const operations = members
    .filter((member) => member.userId?._id)
    .map((member) => {
      const mentioned = contentMentionsUsername(
        cleanContent,
        member.userId?.username
      );

      return {
        updateOne: {
          filter: {
            userId: member.userId._id,
            serverId,
            channelId,
          },
          update: {
            $set: {
              unread: true,
              lastMessageAt: messageCreatedAt,
            },
            ...(mentioned
              ? {
                  $inc: {
                    mentions: 1,
                  },
                }
              : {}),
          },
          upsert: true,
        },
      };
    });

  if (!operations.length) return;

  await Notification.bulkWrite(operations, {
    ordered: false,
  });
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
      replyToId = null,
      attachments = [],
    } = req.body;

    const cleanContent = content.trim();
    const cleanAttachments = Array.isArray(attachments)
      ? attachments.filter((item) => item?.url)
      : [];

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    if (!cleanContent && cleanAttachments.length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (cleanContent.length > 2000) {
      return res.status(400).json({ message: "Message is too long" });
    }

    if (cleanAttachments.length > 10) {
      return res.status(400).json({ message: "Too many attachments" });
    }

    const channel = await Channel.findById(channelId).lean();

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

    const [canView, canSend, canAttach] = await Promise.all([
      hasChannelPermission(membership, channel, "viewChannels"),
      hasChannelPermission(membership, channel, "sendMessages"),
      cleanAttachments.length > 0
        ? hasChannelPermission(membership, channel, "attachFiles")
        : Promise.resolve(true),
    ]);

    if (!canView) {
      return res.status(403).json({
        message: "You cannot view this channel",
      });
    }

    if (!canSend) {
      return res.status(403).json({
        message: "You do not have permission to send messages in this channel",
      });
    }

    if (!canAttach) {
      return res.status(403).json({
        message: "You do not have permission to attach files in this channel",
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

    const safeAttachments = cleanAttachments.map((attachment) => ({
      url: attachment.url,
      type: attachment.type || "image",
      name: attachment.name || "",
      size: attachment.size || 0,
      width: attachment.width || 0,
      height: attachment.height || 0,
    }));

    let replyToMessage = null;

    if (replyToId) {
      replyToMessage = await Message.findOne({
        _id: replyToId,
        channelId,
        serverId: channel.serverId,
      }).select("_id");

      if (!replyToMessage) {
        return res.status(404).json({ message: "Reply message not found" });
      }
    }

    let message = await Message.create({
      serverId: channel.serverId,
      channelId,
      authorId: session.user.id,
      replyToId: replyToMessage?._id || null,
      content: cleanContent,
      attachments: safeAttachments,
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
      })
      .lean();

    await pusherServer.trigger(`channel-${channelId}`, "message:new", message);

    res.status(201).json({ message });

    Promise.resolve()
      .then(() =>
        updateMessageNotifications({
          serverId: channel.serverId,
          channelId,
          senderId: session.user.id,
          cleanContent,
          messageCreatedAt: message.createdAt,
        })
      )
      .catch((error) => {
        console.error("MESSAGE_NOTIFICATION_BACKGROUND_ERROR", error);
      });
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR", error);

    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
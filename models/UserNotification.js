import mongoose from "mongoose";

const UserNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_accept",
        "dm_message",
        "mention",
        "server_invite",
        "system",
      ],
      required: true,
      index: true,
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },

    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      default: null,
    },

    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

UserNotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.UserNotification ||
  mongoose.model("UserNotification", UserNotificationSchema);
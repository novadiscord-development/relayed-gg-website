import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },

    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    unread: {
      type: Boolean,
      default: true,
    },

    mentions: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

NotificationSchema.index(
  {
    userId: 1,
    serverId: 1,
    channelId: 1,
  },
  {
    unique: true,
  }
);

NotificationSchema.index({
  userId: 1,
  updatedAt: -1,
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
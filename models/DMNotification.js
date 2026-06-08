import mongoose from "mongoose";

const DMNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    unread: {
      type: Boolean,
      default: true,
    },

    mentions: {
      type: Number,
      default: 0,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

DMNotificationSchema.index(
  { userId: 1, conversationId: 1 },
  { unique: true }
);

export default mongoose.models.DMNotification ||
  mongoose.model("DMNotification", DMNotificationSchema);
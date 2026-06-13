import mongoose from "mongoose";

const PermissionOverrideSchema = new mongoose.Schema(
  {
    viewChannels: {
      type: String,
      enum: ["allow", "deny", "neutral"],
      default: "neutral",
    },

    sendMessages: {
      type: String,
      enum: ["allow", "deny", "neutral"],
      default: "neutral",
    },

    attachFiles: {
      type: String,
      enum: ["allow", "deny", "neutral"],
      default: "neutral",
    },

    manageMessages: {
      type: String,
      enum: ["allow", "deny", "neutral"],
      default: "neutral",
    },
  },
  { _id: false }
);

const ChannelPermissionSchema = new mongoose.Schema(
  {
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
      index: true,
    },

    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },

    targetType: {
      type: String,
      enum: ["everyone", "role", "member"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    allow: {
      type: [String],
      default: [],
    },

    deny: {
      type: [String],
      default: [],
    },

    overrides: {
      type: PermissionOverrideSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

ChannelPermissionSchema.index(
  {
    channelId: 1,
    targetType: 1,
    targetId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.ChannelPermission ||
  mongoose.model("ChannelPermission", ChannelPermissionSchema);

import mongoose from "mongoose";

const PermissionOverwriteSchema = new mongoose.Schema(
  {
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
      viewChannels: { type: Boolean, default: false },
      sendMessages: { type: Boolean, default: false },
      attachFiles: { type: Boolean, default: false },
      manageMessages: { type: Boolean, default: false },
    },

    deny: {
      viewChannels: { type: Boolean, default: false },
      sendMessages: { type: Boolean, default: false },
      attachFiles: { type: Boolean, default: false },
      manageMessages: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const ChannelSchema = new mongoose.Schema(
  {
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 40,
    },

    type: {
      type: String,
      enum: ["text", "voice", "category"],
      default: "text",
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },

    position: {
      type: Number,
      default: 0,
    },

    permissionOverwrites: {
      type: [PermissionOverwriteSchema],
      default: [],
    },
  },
  { timestamps: true }
);

ChannelSchema.index({ serverId: 1, position: 1 });
ChannelSchema.index({ serverId: 1, parentId: 1 });
ChannelSchema.index({ serverId: 1, "permissionOverwrites.targetType": 1 });

export default mongoose.models.Channel ||
  mongoose.model("Channel", ChannelSchema);

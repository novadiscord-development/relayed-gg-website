import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

ChannelSchema.index({ serverId: 1, position: 1 });

export default mongoose.models.Channel ||
  mongoose.model("Channel", ChannelSchema);
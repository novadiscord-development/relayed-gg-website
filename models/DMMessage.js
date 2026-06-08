import mongoose from "mongoose";

const DMEmbedSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["custom", "link"],
      default: "custom",
    },

    title: {
      type: String,
      trim: true,
      maxlength: 256,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 4096,
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "#7c3aed",
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    thumbnail: {
      type: String,
      trim: true,
      default: "",
    },

    footer: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const DMAttachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["image", "video", "file"],
      default: "file",
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const DMMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    replyToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DMMessage",
      default: null,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    attachments: [DMAttachmentSchema],
    embeds: [DMEmbedSchema],

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

DMMessageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.models.DMMessage ||
  mongoose.model("DMMessage", DMMessageSchema);
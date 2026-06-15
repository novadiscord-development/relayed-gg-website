import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
      trim: true,
    },

    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: false }
);

const AttachmentSchema = new mongoose.Schema(
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

    width: {
      type: Number,
      default: 0,
    },

    height: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
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

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.system;
      },
      default: null,
    },

    systemBot: {
      type: Boolean,
      default: false,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    pinned: {
    type: Boolean,
    default: false,
    index: true,
  },

  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  pinnedAt: {
    type: Date,
    default: null,
  },
    
    attachments: [AttachmentSchema],
    reactions: [ReactionSchema],

    embeds: [
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
],

    system: {
      type: Boolean,
      default: false,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
    replyToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);



MessageSchema.index({ channelId: 1, createdAt: -1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
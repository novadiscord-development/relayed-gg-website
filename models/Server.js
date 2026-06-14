import mongoose from "mongoose";

const ServerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    icon: {
      type: String,
      default: "",
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    banner: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
      index: true,
    },

    publicEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 24,
      },
    ],

    memberCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    discoverableAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

ServerSchema.index({
  visibility: 1,
  publicEnabled: 1,
  memberCount: -1,
  updatedAt: -1,
});

ServerSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

export default mongoose.models.Server || mongoose.model("Server", ServerSchema);

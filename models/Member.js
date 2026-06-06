import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "moderator", "member"],
      default: "member",
    },

    nickname: {
      type: String,
      default: "",
      trim: true,
      maxlength: 32,
    },
  },
  { timestamps: true }
);

MemberSchema.index({ serverId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
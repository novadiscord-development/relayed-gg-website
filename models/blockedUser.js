import mongoose from "mongoose";

const BlockedUserSchema = new mongoose.Schema(
  {
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    blockedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

BlockedUserSchema.index(
  { blockerId: 1, blockedId: 1 },
  { unique: true }
);

export default mongoose.models.BlockedUser ||
  mongoose.model("BlockedUser", BlockedUserSchema);
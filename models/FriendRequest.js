import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

FriendRequestSchema.index(
  { fromUserId: 1, toUserId: 1 },
  { unique: true }
);

export default mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", FriendRequestSchema);
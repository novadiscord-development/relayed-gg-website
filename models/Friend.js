import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

FriendSchema.index(
  { userA: 1, userB: 1 },
  { unique: true }
);

export default mongoose.models.Friend ||
  mongoose.model("Friend", FriendSchema);
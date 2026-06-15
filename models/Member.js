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
      enum: ["owner", "member"],
      default: "member",
    },

    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],

    nickname: {
      type: String,
      default: "",
      trim: true,
      maxlength: 32,
    },
  },
  { timestamps: true }
);

MemberSchema.index(
  {
    serverId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

MemberSchema.index({
  serverId: 1,
  role: 1,
});

MemberSchema.index({
  serverId: 1,
  roles: 1,
});

export default mongoose.models.Member ||
  mongoose.model("Member", MemberSchema);
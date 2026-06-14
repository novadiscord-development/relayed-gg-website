import mongoose from "mongoose";

const ServerBanSchema = new mongoose.Schema(
  {
    serverId: {
      type: String,
      ref: "Server",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

ServerBanSchema.index(
  {
    serverId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.ServerBan ||
  mongoose.model("ServerBan", ServerBanSchema);
import mongoose from "mongoose";

const ServerTimeoutSchema = new mongoose.Schema(
  {
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    moderatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      maxlength: 500,
      default: "",
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ServerTimeoutSchema.index(
  {
    serverId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

ServerTimeoutSchema.virtual("active").get(function () {
  return this.expiresAt > new Date();
});

export default mongoose.models.ServerTimeout ||
  mongoose.model("ServerTimeout", ServerTimeoutSchema);
import mongoose from "mongoose";

const PresenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["online", "idle", "dnd", "offline"],
      default: "online",
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    customStatus: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
  },
  { timestamps: true }
);

PresenceSchema.index({ lastSeenAt: -1 });
PresenceSchema.index({ status: 1 });

export default mongoose.models.Presence ||
  mongoose.model("Presence", PresenceSchema);
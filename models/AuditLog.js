import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    serverId: {
      type: String,
      ref: "Server",
      required: true,
      index: true,
    },

    

    action: {
      type: String,
      required: true,
      enum: [
        "member_timeout",
        "member_timeout_removed",
        "member_kick",
        "member_ban",
        "member_unban",
        "member_warn",
        "message_delete",
        "message_purge",
        "role_create",
        "role_delete",
        "role_update",
        "ownership_transfer",
        "server_update",
      ],
      index: true,
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reason: {
      type: String,
      maxlength: 500,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({
  serverId: 1,
  createdAt: -1,
});

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);
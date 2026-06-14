import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    serverId: {
      type: String,
      ref: "Server",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    color: {
      type: String,
      default: "#99aab5",
    },

    position: {
      type: Number,
      default: 0,
    },

    managed: {
      type: Boolean,
      default: false,
    },

    isEveryone: {
      type: Boolean,
      default: false,
    },

    permissions: {
      manageServer: {
        type: Boolean,
        default: false,
      },

      manageChannels: {
        type: Boolean,
        default: false,
      },

      manageRoles: {
        type: Boolean,
        default: false,
      },

      kickMembers: {
        type: Boolean,
        default: false,
      },

      banMembers: {
        type: Boolean,
        default: false,
      },

      timeoutMembers: {
        type: Boolean,
        default: false,
      },

      manageMessages: {
        type: Boolean,
        default: false,
      },

      mentionEveryone: {
        type: Boolean,
        default: false,
      },

      sendMessages: {
        type: Boolean,
        default: true,
      },

      attachFiles: {
        type: Boolean,
        default: true,
      },

      viewChannels: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

RoleSchema.index(
  {
    serverId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

RoleSchema.index(
  {
    serverId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

RoleSchema.index({
  serverId: 1,
  position: -1,
});

RoleSchema.index({
  serverId: 1,
  isEveryone: 1,
});
export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
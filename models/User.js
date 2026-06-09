import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "/logo.png",
    },

    banner: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    pronouns: {
      type: String,
      maxlength: 40,
      default: "",
    },

    customStatus: {
      type: String,
      maxlength: 100,
      default: "",
    },

    isStaff: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    badges: {
      type: [String],
      default: [],
    },

    settings: {
      dmNotifications: {
        type: Boolean,
        default: true,
      },

      mentionNotifications: {
        type: Boolean,
        default: true,
      },

      friendRequestNotifications: {
        type: Boolean,
        default: true,
      },

      soundEffects: {
        type: Boolean,
        default: true,
      },

      allowFriendRequests: {
        type: String,
        enum: ["everyone", "mutual_servers", "none"],
        default: "everyone",
      },

      allowDMs: {
        type: Boolean,
        default: true,
      },

      showPresence: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
import mongoose from "mongoose";

const ServerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    icon: {
      type: String,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    banner: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Server || mongoose.model("Server", ServerSchema);
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const {
      username,
      avatar,
      banner,
      bio,
      pronouns,
      customStatus,
      settings = {},
    } = req.body;

    const update = {};

    if (typeof username === "string") update.username = username.trim();
    if (typeof avatar === "string") update.avatar = avatar.trim();
    if (typeof banner === "string") update.banner = banner.trim();
    if (typeof bio === "string") update.bio = bio.trim();
    if (typeof pronouns === "string") update.pronouns = pronouns.trim();
    if (typeof customStatus === "string") {
      update.customStatus = customStatus.trim();
    }

    if (update.username && (update.username.length < 3 || update.username.length > 24)) {
      return res.status(400).json({ message: "Username must be 3-24 characters" });
    }

    if (update.bio && update.bio.length > 500) {
      return res.status(400).json({ message: "Bio is too long" });
    }

    if (update.pronouns && update.pronouns.length > 40) {
      return res.status(400).json({ message: "Pronouns are too long" });
    }

    if (update.customStatus && update.customStatus.length > 100) {
      return res.status(400).json({ message: "Custom status is too long" });
    }

    const allowedSettings = [
      "dmNotifications",
      "mentionNotifications",
      "friendRequestNotifications",
      "soundEffects",
      "allowFriendRequests",
      "allowDMs",
      "showPresence",
    ];

    allowedSettings.forEach((key) => {
      if (settings[key] !== undefined) {
        update[`settings.${key}`] = settings[key];
      }
    });

    if (
      update["settings.allowFriendRequests"] &&
      !["everyone", "mutual_servers", "none"].includes(
        update["settings.allowFriendRequests"]
      )
    ) {
      return res.status(400).json({ message: "Invalid friend request setting" });
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: update },
      returnDocument: "after",
    ).select(
      "username email avatar banner bio pronouns customStatus isStaff isAdmin badges settings"
    );

    return res.status(200).json({ user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    console.error("UPDATE_USER_SETTINGS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
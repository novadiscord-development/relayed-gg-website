import connectDB from "@/lib/mongodb";
import Invite from "@/models/Invite";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { code } = req.query;

    const invite = await Invite.findOne({ code })
      .populate("serverId", "name icon description")
      .populate("creatorId", "username avatar");

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(410).json({ message: "Invite expired" });
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return res.status(410).json({ message: "Invite max uses reached" });
    }

    return res.status(200).json({ invite });
  } catch (error) {
    console.error("GET_INVITE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
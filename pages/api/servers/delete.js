import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";
import Channel from "@/models/Channel";
import Message from "@/models/Message";
import Invite from "@/models/Invite";
import Notification from "@/models/Notification";
import ServerBan from "@/models/ServerBan";
import AuditLog from "@/models/AuditLog";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { serverId } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const ownerMember = await Member.findOne({
      serverId,
      userId: session.user.id,
      role: "owner",
    });

    if (!ownerMember) {
      return res.status(403).json({
        message: "Only the server owner can delete this server",
      });
    }

    await Promise.all([
      Message.deleteMany({ serverId }),
      Channel.deleteMany({ serverId }),
      Invite.deleteMany({ serverId }),
      Notification.deleteMany({ serverId }),
      ServerBan.deleteMany({ serverId }),
      Member.deleteMany({ serverId }),
    ]);

    await Server.findByIdAndDelete(serverId);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE_SERVER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Role from "@/models/Role";
import AuditLog from "@/models/AuditLog";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, roleIds = [] } = req.body;

    if (!serverId || !Array.isArray(roleIds)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const membership = await Member.findOne({ serverId, userId: session.user.id });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "You do not have permission to manage roles" });
    }

    await Promise.all(
      roleIds.map((roleId, index) =>
        Role.updateOne(
          { _id: roleId, serverId },
          { $set: { position: roleIds.length - index } }
        )
      )
    );

    await AuditLog.create({
      serverId,
      action: "role_update",
      actorId: session.user.id,
      metadata: {
        reordered: true,
        roleIds,
      },
    });

    const roles = await Role.find({ serverId }).sort({ position: -1 }).lean();

    return res.status(200).json({ roles });
  } catch (error) {
    console.error("REORDER_ROLES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
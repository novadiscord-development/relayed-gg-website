import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Role from "@/models/Role";
import AuditLog from "@/models/AuditLog";
import { hasPermission } from "@/lib/permissions";

function cleanColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color || "") ? color : "#99aab5";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ message: "Unauthorized" });

    await connectDB();

    const { serverId, name, color = "#99aab5" } = req.body;

    if (!serverId) return res.status(400).json({ message: "Server ID is required" });

    const cleanName = String(name || "").trim();

    if (!cleanName) return res.status(400).json({ message: "Role name is required" });
    if (cleanName.length > 40) return res.status(400).json({ message: "Role name is too long" });
    if (cleanName.toLowerCase() === "@everyone") {
      return res.status(400).json({ message: "You cannot create another @everyone role" });
    }

    const membership = await Member.findOne({ serverId, userId: session.user.id });

    if (!membership || !(await hasPermission(membership, "manageRoles"))) {
      return res.status(403).json({ message: "You do not have permission to manage roles" });
    }

    const existingRole = await Role.findOne({ serverId, name: cleanName });

    if (existingRole) {
      return res.status(400).json({ message: "A role with that name already exists" });
    }

    const highestRole = await Role.findOne({
      serverId,
      isEveryone: { $ne: true },
    }).sort({ position: -1 });

    const role = await Role.create({
      serverId,
      name: cleanName,
      color: cleanColor(color),
      position: highestRole ? highestRole.position + 1 : 1,
      managed: false,
      isEveryone: false,
    });

    await AuditLog.create({
      serverId,
      action: "role_create",
      actorId: session.user.id,
      metadata: {
        roleId: role._id,
        roleName: role.name,
      },
    });

    return res.status(201).json({ role });
  } catch (error) {
    console.error("CREATE_ROLE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
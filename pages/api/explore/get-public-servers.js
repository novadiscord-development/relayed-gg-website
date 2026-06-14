import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import connectDB from "@/lib/mongodb";
import Server from "@/models/Server";
import Member from "@/models/Member";

function cleanSearch(value) {
  return String(value || "").trim().slice(0, 80);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { q = "", tag = "", limit = 30 } = req.query;

    const cleanLimit = Math.min(Math.max(Number(limit) || 30, 1), 50);
    const cleanQuery = cleanSearch(q);
    const cleanTag = String(tag || "").trim().toLowerCase().slice(0, 24);

    const filter = {
      visibility: "public",
      publicEnabled: true,
    };

    if (cleanTag) {
      filter.tags = cleanTag;
    }

    if (cleanQuery) {
      filter.$text = { $search: cleanQuery };
    }

    const servers = await Server.find(filter)
      .select(
        "name icon banner description tags memberCount ownerId visibility publicEnabled discoverableAt createdAt updatedAt"
      )
      .sort(cleanQuery ? { score: { $meta: "textScore" } } : { memberCount: -1, updatedAt: -1 })
      .limit(cleanLimit)
      .lean();

    const memberships = await Member.find({
      userId: session.user.id,
      serverId: { $in: servers.map((server) => server._id) },
    })
      .select("serverId")
      .lean();

    const joinedServerIds = new Set(
      memberships.map((member) => member.serverId.toString())
    );

    return res.status(200).json({
      servers: servers.map((server) => ({
        ...server,
        joined: joinedServerIds.has(server._id.toString()),
      })),
    });
  } catch (error) {
    console.error("GET_PUBLIC_SERVERS_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

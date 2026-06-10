import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { tags } from "../db/schema.ts";
import { eq, and, desc, inArray } from "drizzle-orm";

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body;

    const existTag = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    });

    if (existTag) {
      return res
        .status(401)
        .json({ message: "Tag with this name is already exist" });
    }

    const newTag = await db
      .insert(tags)
      .values({
        name,
        color: color || "#6B7280", // Default gray color
      })
      .returning();

    res.json({ message: "Tag was created successfully", tag: newTag });
  } catch (error) {
    console.error("Create tag error", error);
    return res.status(500).json({ error: "Failed to create tag" });
  }
};

import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { habitTags, tags } from "../db/schema.ts";
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

export const getAllTags = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db.select().from(tags).orderBy(tags.name);

    res.json({ tags: result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get all tags" });
  }
};

export const getTagById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existTag = await db.query.tags.findFirst({
      where: eq(tags.id, id),
      with: {
        habitTags: {
          with: {
            habit: {
              columns: {
                id: true,
                name: true,
                description: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    if (!existTag) {
      return res.status(404).json({ message: "Tag with this id is not exist" });
    }

    // transform the data
    const tagsWithHabits = {
      ...existTag,
      habit: existTag.habitTags.map((ht) => ht.habit),
      habitTags: undefined,
    };

    res.json({ tag: tagsWithHabits });
  } catch (error) {
    console.error("Get tag error:", error);
    res.status(500).json({ error: "Failed to fetch tag" });
  }
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    if (name) {
      const getTag = await db.query.tags.findFirst({
        where: eq(tags.name, name),
      });
      if (getTag && getTag.id !== id) {
        return res
          .status(404)
          .json({ message: "Tag with this name already exists" });
      }
    }

    const updateTheTag = await db
      .update(tags)
      .set({
        name: name,
        color: color,
        updatedAt: new Date(),
      })
      .where(eq(tags.id, id))
      .returning();

    if (!updateTheTag) {
      return res.status(404).json({ message: "Tag is not found" });
    }

    res.json({ message: "Tag updated successefully", tag: updateTheTag });
  } catch (error) {
    console.error("update tag error", error);
    return res.status(500).json({ message: "Failed to update tag" });
  }
};

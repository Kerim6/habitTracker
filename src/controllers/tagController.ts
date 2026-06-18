import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { habitTags, tags } from "../db/schema.ts";
import { eq, and, desc, inArray } from "drizzle-orm";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ConflictError } from "../errors/ConflictError.ts";

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  const { name, color } = req.body;

  const existTag = await db.query.tags.findFirst({
    where: eq(tags.name, name),
  });

  if (existTag) {
    throw new ConflictError("Tag with this name is already exist");
  }

  const newTag = await db
    .insert(tags)
    .values({
      name,
      color: color || "#6B7280", // Default gray color
    })
    .returning();

  res.json({ message: "Tag was created successfully", tag: newTag });
};

export const getAllTags = async (req: AuthenticatedRequest, res: Response) => {
  const result = await db.select().from(tags).orderBy(tags.name);

  res.json({ tags: result });
};

export const getTagById = async (req: AuthenticatedRequest, res: Response) => {
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
    throw new NotFoundError("Tag with this id is not exist");
  }

  // transform the data
  const tagsWithHabits = {
    ...existTag,
    habit: existTag.habitTags.map((ht) => ht.habit),
    habitTags: undefined,
  };

  res.json({ tag: tagsWithHabits });
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, color } = req.body;

  if (name) {
    const getTag = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    });
    if (getTag && getTag.id !== id) {
      throw new ConflictError("Tag with this name is already exists");
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
    throw new NotFoundError("Tag is not found");
  }

  res.json({ message: "Tag updated successefully", tag: updateTheTag });
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const findTag = await db.query.tags.findFirst({
    where: eq(tags.id, id),
  });

  if (!findTag) {
    throw new NotFoundError("Tag is not found");
  }

  const deletedTag = await db.delete(tags).where(eq(tags.id, id));

  res.json({ message: "Tag is deleted successfully" });
};

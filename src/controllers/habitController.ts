import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { habits, entries, habitTags, tags } from "../db/schema.ts";
import { eq, and, inArray, desc } from "drizzle-orm";

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create the habit
    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning();

      // If there are tags, create entries in the habitTags junction table
      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }));
        await tx.insert(habitTags).values(habitTagValues);
      }
      return newHabit;
    });
    res
      .status(201)
      .json({ message: "Habit created successfully", habit: result });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

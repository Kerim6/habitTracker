import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { habits, entries, habitTags, tags } from "../db/schema.ts";
import { eq, and, inArray, desc } from "drizzle-orm";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    // return res.status(401).json({ message: "Unauthorized" });
    throw new UnauthorizedError("You have to login first");
  }

  // Query habits with their tags using relations
  const userHabitsWithTags = await db.query.habits.findMany({
    where: eq(habits.userId, userId),
    with: {
      habitTags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: [desc(habits.createdAt)],
  });

  // Transform the data to include tags directly
  const habitsWithTags = userHabitsWithTags.map((habit) => ({
    ...habit,
    tags: habit.habitTags.map((ht) => ht.tag),
    habitTags: undefined, // Remove intermediate relation
  }));

  res.json({
    habits: habitsWithTags,
  });
};

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError(
      "You have to login first to access this resource",
    );
  }
  // Query the habit with its tags using relations
  const habitWithTags = await db.query.habits.findFirst({
    where: and(eq(habits.id, id), eq(habits.userId, userId)),
    with: {
      habitTags: {
        with: {
          tag: true,
        },
      },
      entries: {
        orderBy: [desc(entries.createdAt)],
        limit: 10,
      },
    },
  });
  if (!habitWithTags) {
    throw new NotFoundError("The required habit is not found");
  }
  // Transform the data to include tags directly
  const habit = {
    ...habitWithTags,
    tags: habitWithTags.habitTags.map((ht) => ht.tag),
    habitTags: undefined, // Remove intermediate relation
  };
  res.json({ habit: habit });
};

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, frequency, targetCount, tagIds } = req.body;
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("You have login first");
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
};

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, frequency, targetCount, isActive, tagIds } =
    req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("You have to login first");
  }
  // update the habit
  const result = await db.transaction(async (tx) => {
    const [updatedHabit] = await tx
      .update(habits)
      .set({
        name,
        description,
        frequency,
        targetCount,
        isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();

    if (!updatedHabit) {
      throw new NotFoundError("The habit you want to update is not found");
    }

    // if tags provided
    if (tagIds !== undefined) {
      // remove existing tag
      await tx.delete(habitTags).where(eq(habitTags.habitId, id));

      // add new tags
      if (tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: id,
          tagId,
        }));
        await tx.insert(habitTags).values(habitTagValues);
      }
    }
    return updatedHabit;
  }); // end of the tx
  res.json({ message: "Habit updated succussfully", habit: result });
};

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("You have to login first");
  }

  const [deletedHabit] = await db
    .delete(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .returning();

  if (!deletedHabit) {
    return res.status(404).json({ message: "Habit not found" });
  }

  res.json({ message: "Habit deleted successfully" });
};

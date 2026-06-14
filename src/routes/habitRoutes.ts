import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.ts";
import {
  createHabit,
  getUserHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} from "../controllers/habitController.ts";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { z } from "zod";

const router = Router();

router.use(authenticate); // Apply authentication middleware to all habit routes

const habitInsertSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"] as const, {
    error: "Frequency must be daily, weekly, or monthly",
  }),
  targetCount: z.number().int().positive().default(1),
  tagIds: z.array(z.string().uuid()).optional(),
});

const uuidSchema = z.object({
  id: z.string().uuid("Invalid parameter"),
});

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"] as const, {
    error: "Frequency must be daily, weekly, or monthly",
  }),
  targetCount: z.number().int().positive().default(1),
  tagIds: z.array(z.string().uuid()).optional(),
});

// Get all habits for the authenticated user
router.get("/", authorize("admin"), getUserHabits);

// Get a specific habit by ID
router.get("/:id", validateParams(uuidSchema), getHabitById);

// Create a new habit
router.post("/", validateBody(habitInsertSchema), createHabit);

// Update a habit
router.put(
  "/:id",
  validateParams(uuidSchema),
  validateBody(updateHabitSchema),
  updateHabit,
);

// Delete a habit
router.delete("/:id", validateParams(uuidSchema), deleteHabit);

export default router;

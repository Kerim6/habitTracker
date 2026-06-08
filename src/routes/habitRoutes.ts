import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import {
  createHabit,
  getUserHabits,
  getHabitById,
  updateHabit,
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
router.get("/", getUserHabits);

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

// Habit completion routes
router.post("/:id/complete", (req, res) => {
  res.json({ message: `Mark habit ${req.params.id} complete` });
});

router.get("/:id/stats", (req, res) => {
  res.json({ message: `Get stats for habit ${req.params.id}` });
});

export default router;

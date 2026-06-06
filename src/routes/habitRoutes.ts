import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { createHabit, getUserHabits } from "../controllers/habitController.ts";
import { validateBody } from "../middleware/validation.ts";
import { z } from "zod";

const router = Router();

router.use(authenticate); // Apply authentication middleware to all habit routes

const habitInsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  targetCount: z.number().int().positive().default(1),
  tagIds: z.array(z.string().uuid()).optional(),
});

// Get all habits for the authenticated user
router.get("/", getUserHabits);

// Create a new habit
router.post("/", validateBody(habitInsertSchema), createHabit);

// Habit completion routes
router.post("/:id/complete", (req, res) => {
  res.json({ message: `Mark habit ${req.params.id} complete` });
});

router.get("/:id/stats", (req, res) => {
  res.json({ message: `Get stats for habit ${req.params.id}` });
});

export default router;

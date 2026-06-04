import { Router } from "express";
import { register, login } from "../controllers/authController.ts";
import { validateBody } from "../middleware/validation.ts";
import { UserInsertSchema } from "../db/schema.ts"; // Import any necessary types for validation
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Authentication routes
router.post("/register", validateBody(UserInsertSchema), register);

router.post("/login", validateBody(loginSchema), login);

router.post("/logout", (req, res) => {
  res.json({ message: "User logged out" });
});

router.post("/refresh", (req, res) => {
  res.json({ message: "Token refreshed" });
});

export default router;

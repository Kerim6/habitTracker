import { Router } from "express";
import { register } from "../controllers/authController.ts";
import { validateBody } from "../middleware/validation.ts";
import { UserInsertSchema } from "../db/schema.ts"; // Import any necessary types for validation

const router = Router();

// Authentication routes
router.post("/register", validateBody(UserInsertSchema), register);

router.post("/login", (req, res) => {
  res.json({ message: "User logged in" });
});

router.post("/logout", (req, res) => {
  res.json({ message: "User logged out" });
});

router.post("/refresh", (req, res) => {
  res.json({ message: "Token refreshed" });
});

export default router;

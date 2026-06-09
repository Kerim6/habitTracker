import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import {
  getAllUsers,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/userController.ts";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { z } from "zod";

const router = Router();

const UserUpdateSchema = z.object({
  email: z.email(),
  username: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 charachters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),
});

router.use(authenticate); // Apply authentication middleware to all user routes

// Routes are relative to where router is mounted
router.get("/", getAllUsers);

router.get("/profile", getProfile);

router.put("/profile", validateBody(UserUpdateSchema), updateProfile);

router.post(
  "/change-password",
  validateBody(ChangePasswordSchema),
  changePassword,
);

export default router;

import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.ts";
import {
  getAllUsers,
  getProfile,
  updateProfile,
  changePassword,
  deleteUser,
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

const uuidSchema = z.object({
  id: z.uuid(),
});

router.use(authenticate); // Apply authentication middleware to all user routes

// Routes are relative to where router is mounted
router.get("/", authorize("admin"), getAllUsers);

router.get("/profile", authorize("user"), getProfile);

router.put(
  "/profile",
  authorize("user"),
  validateBody(UserUpdateSchema),
  updateProfile,
);

router.post(
  "/change-password",
  authorize("admin", "user"),
  validateBody(ChangePasswordSchema),
  changePassword,
);

router.delete(
  "/:id",
  validateParams(uuidSchema),
  authorize("admin"),
  deleteUser,
);

export default router;

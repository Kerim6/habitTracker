import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import {
  getAllUsers,
  getProfile,
  updateProfile,
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

router.use(authenticate); // Apply authentication middleware to all user routes

// Routes are relative to where router is mounted
router.get("/", getAllUsers);

router.get("/profile", getProfile);

router.put("/profile", validateBody(UserUpdateSchema), updateProfile);

router.delete("/:id", (req, res) => {
  res.json({ message: `Delete user ${req.params.id}` });
});

export default router;

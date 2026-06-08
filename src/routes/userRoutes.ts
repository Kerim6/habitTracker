import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { getAllUsers, getProfile } from "../controllers/userController.ts";
import { validateParams } from "../middleware/validation.ts";
import { z } from "zod";

const router = Router();

router.use(authenticate); // Apply authentication middleware to all user routes

// Routes are relative to where router is mounted
router.get("/", getAllUsers);

router.get("/profile", getProfile);

router.post("/", (req, res) => {
  res.status(201).json({ message: "User created" });
});

router.put("/:id", (req, res) => {
  res.json({ message: `Update user ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
  res.json({ message: `Delete user ${req.params.id}` });
});

export default router;

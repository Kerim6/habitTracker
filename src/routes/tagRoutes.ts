import { Router } from "express";
import {
  createTag,
  getAllTags,
  getTagById,
} from "../controllers/tagController.ts";
import { authenticate } from "../middleware/auth.ts";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { TagInsertSchema } from "../db/schema.ts";
import { z } from "zod";

const router = Router();

router.use(authenticate);

const uuidSchema = z.object({
  id: z.uuid(),
});

router.post("/", validateBody(TagInsertSchema), createTag);
router.get("/", getAllTags);
router.get("/:id", validateParams(uuidSchema), getTagById);

export default router;

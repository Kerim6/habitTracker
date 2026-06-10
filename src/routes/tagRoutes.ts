import { Router } from "express";
import { createTag, getAllTags } from "../controllers/tagController.ts";
import { authenticate } from "../middleware/auth.ts";
import { validateBody } from "../middleware/validation.ts";
import { TagInsertSchema } from "../db/schema.ts";

const router = Router();

router.use(authenticate);

router.post("/", validateBody(TagInsertSchema), createTag);
router.get("/", getAllTags);

export default router;

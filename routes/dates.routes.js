import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { create, getAllByCouple, remove } from "../controllers/dates.controller.js";

const router = Router();

router.get("/", authMiddleware.verifySession, getAllByCouple);
router.post("/", authMiddleware.verifySession, create);
router.delete("/:id", authMiddleware.verifySession, remove);

export default router;

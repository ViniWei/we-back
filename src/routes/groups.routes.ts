import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  get,
  generateInviteCode,
  joinGroup,
} from "../controllers/groups.controller";

const router = Router();

router.get("/:id", authMiddleware.verifySession, get);
router.post("/generate-code", authMiddleware.verifySession, generateInviteCode);
router.post("/join", authMiddleware.verifySession, joinGroup);

export default router;

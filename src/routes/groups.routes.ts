import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  get,
  generateInviteCode,
  joinGroup,
  getMembers,
  checkLinkStatus,
} from "../controllers/groups.controller";

const router = Router();

router.get("/members", authMiddleware.verifySession, getMembers);
router.get("/check-link-status", authMiddleware.verifySession, checkLinkStatus);
router.get("/:id", authMiddleware.verifySession, get);
router.post("/generate-code", authMiddleware.verifySession, generateInviteCode);
router.post("/join", authMiddleware.verifySession, joinGroup);

export default router;

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

router.get("/members", authMiddleware.verifyToken, getMembers);
router.get("/check-link-status", authMiddleware.verifyToken, checkLinkStatus);
router.get("/:id", authMiddleware.verifyToken, get);
router.post("/generate-code", authMiddleware.verifyToken, generateInviteCode);
router.post("/join", authMiddleware.verifyToken, joinGroup);

export default router;

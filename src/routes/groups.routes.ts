import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  get,
  generateInviteCode,
  joinGroup,
  getMembers,
  checkLinkStatus,
  updateGroupImage,
  getGroupImage,
  updateRelationshipStartDate,
  getRelationshipStartDate,
} from "../controllers/groups.controller";

const router = Router();

router.get("/members", authMiddleware.verifyToken, getMembers);
router.get("/check-link-status", authMiddleware.verifyToken, checkLinkStatus);
router.get("/group-image", authMiddleware.verifyToken, getGroupImage);
router.get(
  "/relationship-start-date",
  authMiddleware.verifyToken,
  getRelationshipStartDate
);
router.get("/:id", authMiddleware.verifyToken, get);
router.post("/generate-code", authMiddleware.verifyToken, generateInviteCode);
router.post("/join", authMiddleware.verifyToken, joinGroup);
router.put("/group-image", authMiddleware.verifyToken, updateGroupImage);
router.put(
  "/relationship-start-date",
  authMiddleware.verifyToken,
  updateRelationshipStartDate
);

export default router;

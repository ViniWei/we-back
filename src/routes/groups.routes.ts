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

router.use(authMiddleware.verifyToken);

router.get("/members", getMembers);
router.get("/check-link-status", checkLinkStatus);
router.get("/group-image", getGroupImage);
router.get("/relationship-start-date", getRelationshipStartDate);
router.get("/:id", get);
router.post("/generate-code", generateInviteCode);
router.post("/join", joinGroup);
router.put("/group-image", updateGroupImage);
router.put("/relationship-start-date", updateRelationshipStartDate);

export default router;

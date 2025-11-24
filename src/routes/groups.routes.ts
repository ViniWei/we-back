import { Router } from "express";
import multer from "multer";
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

// Configuração do multer para upload em memória (mais eficiente para S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.use(authMiddleware.verifyToken);

router.get("/members", getMembers);
router.get("/check-link-status", checkLinkStatus);
router.get("/group-image", getGroupImage);
router.get("/relationship-start-date", getRelationshipStartDate);
router.get("/:id", get);
router.post("/generate-code", generateInviteCode);
router.post("/join", joinGroup);
router.put("/group-image", upload.single("photo"), updateGroupImage);
router.put("/relationship-start-date", updateRelationshipStartDate);

export default router;

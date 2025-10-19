import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  get,
  create,
  login,
  logout,
  verifyEmailCode,
  changePassword,
  updateUserLanguage,
  refreshToken,
} from "../controllers/users.controller";

const router = Router();

router.get("/", authMiddleware.verifyToken, get);
router.post("/login", login);
router.post("/logout", authMiddleware.verifyToken, logout);
router.post("/", create);
router.post("/verifyEmail", verifyEmailCode);
router.post("/refresh-token", refreshToken);
router.patch("/change-password", authMiddleware.verifyToken, changePassword);
router.patch("/language", authMiddleware.verifyToken, updateUserLanguage);

export default router;

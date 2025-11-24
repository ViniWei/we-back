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
  requestVerificationCode,
  requestResetPassword,
  resetPassword,
  googleAuth,
  checkDailyAccess,
} from "../controllers/users.controller";

const router = Router();

router.get("/", authMiddleware.verifyToken, get);
router.get("/check-daily-access", authMiddleware.verifyToken, checkDailyAccess);
router.post("/login", login);
router.post("/logout", authMiddleware.verifyToken, logout);
router.post("/", create);
router.post("/verifyEmail", verifyEmailCode);
router.post(
  "/requestVerificationCode",
  authMiddleware.verifyToken,
  requestVerificationCode
);
router.post("/refresh-token", refreshToken);
router.patch("/change-password", authMiddleware.verifyToken, changePassword);
router.patch("/language", authMiddleware.verifyToken, updateUserLanguage);
router.post("/requestResetPassword", requestResetPassword);
router.post("/resetPassword", resetPassword);
router.post("/google-auth", googleAuth);

export default router;

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
} from "../controllers/users.controller";

const router = Router();

router.get("/", authMiddleware.verifySession, get);
router.get("/session-status", (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});
router.post("/login", login);
router.post("/logout", authMiddleware.verifySession, logout);
router.post("/", create);
router.post("/verifyEmail", verifyEmailCode);
router.patch("/change-password", authMiddleware.verifySession, changePassword);
router.patch("/language", authMiddleware.verifySession, updateUserLanguage);

export default router;

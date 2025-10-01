import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  get,
  create,
  remove,
  login,
  update,
  changePassword,
  verifyEmailCode,
  requestVerificationCode,
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", authMiddleware.verifySession, get);
router.post("/login", login);
router.put("/changePassword/", authMiddleware.verifySession, changePassword);
router.post("/", create);
router.patch("/", authMiddleware.verifySession, update);
router.delete("/", authMiddleware.verifySession, remove);
router.post("/verifyEmail", verifyEmailCode);
router.post(
  "/requestVerificationCode",
  authMiddleware.verifySession,
  requestVerificationCode
);

export default router;

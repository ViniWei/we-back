import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  get,
  create,
  login,
  verifyEmailCode,
} from "../controllers/users.controller";

const router = Router();

router.get("/", authMiddleware.verifySession, get);
router.post("/login", login);
router.post("/", create);
router.post("/verifyEmail", verifyEmailCode);

export default router;

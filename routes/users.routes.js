import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    getAll,
    get,
    create,
    remove,
    login,
    update,
    changePassword,
    verifyEmailCode,
    requestVerificationCode
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", authMiddleware.verifySession, getAll);
router.get("/:id", authMiddleware.verifySession, get);
router.post("/login", login);
router.put("/changePassword/:id", authMiddleware.verifySession, changePassword);
router.post("/", create);
router.patch("/:id", authMiddleware.verifySession, update);
router.delete("/:id", authMiddleware.verifySession, remove);
router.post("/verifyEmail", authMiddleware.verifySession, verifyEmailCode);
router.post("/requestVerificationCode", authMiddleware.verifySession, requestVerificationCode);

export default router;

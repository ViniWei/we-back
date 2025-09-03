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
router.get("/:id", get);
router.post("/login", login);
router.put("/changePassword/:id", changePassword);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.post("/verifyEmail", verifyEmailCode);
router.post("/requestVerificationCode", requestVerificationCode);

export default router;

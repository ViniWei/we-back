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
    verifyEmailCode
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", authMiddleware.verifyToken, getAll);
router.get("/:id", get);
router.post("/login", login);
router.put("/changePassword/:id", changePassword);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.post("/verifyEmail", verifyEmailCode);

export default router;

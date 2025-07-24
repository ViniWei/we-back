import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    getAll,
    get,
    create,
    remove,
    login
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", authMiddleware.verifyToken, getAll);
router.get("/:id", get);
router.post("/login", login);
router.post("/", create);
router.delete("/:id", remove);

export default router;

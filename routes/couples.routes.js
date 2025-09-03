import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    getAll,
    get,
} from "../controllers/couples.controller.js";

const router = Router();

router.get("/", authMiddleware.verifySession, getAll);
router.get("/:id", authMiddleware.verifySession, get);

export default router;

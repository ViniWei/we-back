import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import { getAll, get, getOrCreateIfNotExists, create, getListsWithMoviesByCouple } from "../controllers/movies.controller.js";

const router = Router();

router.get("/", authMiddleware.verifySession, getAll);
router.get("/:id", authMiddleware.verifySession, get);
router.get("/couple/", authMiddleware.verifySession, getListsWithMoviesByCouple);
router.post("/api", authMiddleware.verifySession, getOrCreateIfNotExists);
router.post("/", authMiddleware.verifySession, create);

export default router;

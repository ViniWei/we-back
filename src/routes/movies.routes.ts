import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  getAll,
  get,
  create,
  createFromApi,
} from "../controllers/movies.controller";

const router = Router();

router.get("/", authMiddleware.verifySession, getAll);
router.get("/:id", authMiddleware.verifySession, get);
router.post("/", authMiddleware.verifySession, create);
router.post("/api", authMiddleware.verifySession, createFromApi);

export default router;

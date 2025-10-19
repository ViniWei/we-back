import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  getAll,
  get,
  create,
  createFromApi,
} from "../controllers/movies.controller";

const router = Router();

router.get("/", authMiddleware.verifyToken, getAll);
router.get("/:id", authMiddleware.verifyToken, get);
router.post("/", authMiddleware.verifyToken, create);
router.post("/api", authMiddleware.verifyToken, createFromApi);

export default router;

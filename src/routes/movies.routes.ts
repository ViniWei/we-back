import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

import {
  getAll,
  get,
  create,
  createFromApi,
} from "../controllers/movies.controller";

const router = Router();

router.use(authMiddleware.verifyToken);

router.get("/", getAll);
router.get("/:id", get);
router.post("/", create);
router.post("/api", createFromApi);

export default router;

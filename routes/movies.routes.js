import { Router } from "express";

import { getAll, get, create} from "../controllers/movies.controller.js";

const router = Router();

router.get("/", getAll)
router.get("/:id", get);
router.post("/", create);

export default router;

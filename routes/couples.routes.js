import { Router } from "express";

import {
    getAll,
    get,
} from "../controllers/couples.controller.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", get);

export default router;

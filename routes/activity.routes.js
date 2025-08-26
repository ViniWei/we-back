import { Router } from "express";

import {
    getAll,
    getById,
    create,
    update,
    deleteById
} from "../controllers/activity.controller.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", deleteById);

export default router;

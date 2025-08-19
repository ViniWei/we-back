import { Router } from "express";

import { getAll, get, getOrCreateIfNotExists, create, getListsWithMoviesByCouple } from "../controllers/movies.controller.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", get);
router.get("/couple/:couple_id", getListsWithMoviesByCouple);
router.post("/api", getOrCreateIfNotExists);
router.post("/", create);

export default router;

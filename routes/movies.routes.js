import { Router } from "express";

import { getAll, get, create, getListsWithMoviesByCouple } from "../controllers/movies.controller.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", get);
router.get("/couple/:couple_id", getListsWithMoviesByCouple);
router.post("/", create);

export default router;

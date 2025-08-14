import { Router } from "express";

import { getListsByCouple, get, create, createMovieList, getMoviesByListId, addMovieToList, removeFromList, removeList } from "../controllers/movies.controller.js";

const router = Router();

router.get("/:id", get);
router.post("/", create);
router.post("/list", createMovieList)
router.get("/list/couple/:id", getListsByCouple);
router.get("/list/:id", getMoviesByListId);
router.post("/list/add/:id", addMovieToList);
router.delete("/list/remove/:id", removeFromList);
router.delete("/list/:id", removeList);

export default router;

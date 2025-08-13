import { Router } from "express";

import { getAllByCoupleId, get, create, getMoviesByListId, addMovieToList, removeFromList, removeList } from "../controllers/movies.controller.js";

const router = Router();

router.get("/couple/:id", getAllByCoupleId);
router.get("/:id", get);
router.post("/", create);
router.get("/list/:id", getMoviesByListId);
router.post("/list", addMovieToList);
router.delete("/:id", removeFromList);
router.delete("/list/:id", removeList);

export default router;

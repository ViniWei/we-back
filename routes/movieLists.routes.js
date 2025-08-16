import { Router } from "express";
import { get, createMovieList, getListsByCouple, deleteList } from "../controllers/movieLists.controller.js"; 

const router = Router();

router.get("/:id", get);
router.post("/", createMovieList)
router.get("/couple/:id", getListsByCouple);
router.delete("/:id", deleteList);

export default router;
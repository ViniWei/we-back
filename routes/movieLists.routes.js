import { Router } from "express";
import { createMovieList, getListsByCouple, getMoviesByListId, addMovieToList, removeFromList, removeList } from "../controllers/movieLists.controller.js"; 

const router = Router();

router.post("/list", createMovieList)
router.get("/list/couple/:id", getListsByCouple);
router.get("/list/:id", getMoviesByListId);
router.post("/list/add/:id", addMovieToList);
router.delete("/list/remove/:id", removeFromList);
router.delete("/list/:id", removeList);
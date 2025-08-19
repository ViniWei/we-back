import { Router } from "express";
import { getAll, get, create, addToList, update, removeFromList,deleteList } from "../controllers/movieLists.controller.js"; 

const router = Router();

router.get("/", getAll);
router.get("/:id", get);
router.post("/", create);
router.post("/add", addToList);
router.delete("/remove/:id", removeFromList);
router.put("/:id", update);
router.delete("/:id", deleteList);

export default router;
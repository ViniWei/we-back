import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  getAll,
  get,
  getByGroupId,
  getByGroupIdWithMovies,
  create,
  update,
  remove,
  addMovieToList,
  removeMovieFromList,
} from "../controllers/movieLists.controller";

const router = Router();

router.get("/", authMiddleware.verifyToken, getAll);
router.get("/group", authMiddleware.verifyToken, getByGroupId);
router.get(
  "/group/with-movies",
  authMiddleware.verifyToken,
  getByGroupIdWithMovies
);
router.get("/:id", authMiddleware.verifyToken, get);
router.post("/", authMiddleware.verifyToken, create);
router.put("/:id", authMiddleware.verifyToken, update);
router.delete("/:id", authMiddleware.verifyToken, remove);
router.post("/:listId/movies", authMiddleware.verifyToken, addMovieToList);
router.delete(
  "/:listId/movies/:movieId",
  authMiddleware.verifyToken,
  removeMovieFromList
);

export default router;

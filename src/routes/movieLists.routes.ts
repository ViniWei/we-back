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

router.get("/", authMiddleware.verifySession, getAll);
router.get("/group", authMiddleware.verifySession, getByGroupId);
router.get(
  "/group/with-movies",
  authMiddleware.verifySession,
  getByGroupIdWithMovies
);
router.get("/:id", authMiddleware.verifySession, get);
router.post("/", authMiddleware.verifySession, create);
router.put("/:id", authMiddleware.verifySession, update);
router.delete("/:id", authMiddleware.verifySession, remove);
router.post("/:listId/movies", authMiddleware.verifySession, addMovieToList);
router.delete(
  "/:listId/movies/:movieId",
  authMiddleware.verifySession,
  removeMovieFromList
);

export default router;

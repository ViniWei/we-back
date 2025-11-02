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

router.use(authMiddleware.verifyToken);

router.get("/", getAll);
router.get("/group", getByGroupId);
router.get("/group/with-movies", getByGroupIdWithMovies);
router.get("/:id", get);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:listId/movies", addMovieToList);
router.delete("/:listId/movies/:movieId", removeMovieFromList);

export default router;

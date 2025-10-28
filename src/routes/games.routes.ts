import { Router } from "express";
import { GamesController } from "../controllers/games.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();
const controller = new GamesController();

router.get("/", authMiddleware.verifyToken, controller.getAllGames);
router.get("/:id", authMiddleware.verifyToken, controller.getGameById);
router.post("/", authMiddleware.verifyToken, controller.createGame); // manual
router.post("/igdb/:id", authMiddleware.verifyToken, controller.addFromIGDB); // direto da API
router.put("/:id", authMiddleware.verifyToken, controller.updateGame);
router.delete("/:id", authMiddleware.verifyToken, controller.deleteGame);

export default router;

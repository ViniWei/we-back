import express from "express";
import recommendationsController from "../controllers/recommendations.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/",
  authMiddleware.verifyToken,
  recommendationsController.getRecommendation
);

export default router;

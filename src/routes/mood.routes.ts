import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  getAllMoods,
  getTodayMood,
  createMood,
  updateMood,
  getGroupMoodsByMonth,
} from "../controllers/mood.controller";

const router = Router();

router.get("/list", getAllMoods);

router.use(authMiddleware.verifyToken);

router.get("/today", getTodayMood);
router.get("/group/:year/:month", getGroupMoodsByMonth);
router.post("/", createMood);
router.put("/:id", updateMood);

export default router;

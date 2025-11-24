import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { processVoiceCommand } from "../controllers/voice.controller";

const router = Router();

router.use(authMiddleware.verifyToken);

router.post("/process", processVoiceCommand);

export default router;

import { Router, Request, Response } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { handleVoiceCommand } from "../services/voice.service";

const router = Router();

router.use(authMiddleware.verifyToken);

router.post("/process", async (req: Request, res: Response) => {
  try {
    const { text, user_id, group_id } = req.body;
    console.log(text, user_id, group_id);
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Texto não fornecido." });
    }

    const result = await handleVoiceCommand(text, user_id, group_id);

    console.log("Retorno VoiceService →", JSON.stringify(result, null, 2));
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Erro em /voice/process:", error.message || error);
    return res
      .status(500)
      .json({ error: "Erro interno ao processar o comando de voz." });
  }
});

export default router;

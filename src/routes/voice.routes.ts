import { Router, Request, Response } from "express";
import voiceService from "../services/voice.service.js";

const router = Router();

router.post("/process", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token JWT ausente ou inválido." });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Texto não fornecido." });
    }

    const result = await voiceService.handleVoiceCommand(text, token);

    console.log("Retorno VoiceService →", JSON.stringify(result, null, 2));
    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Erro em /voice/process:", error.message || error);
    return res.status(500).json({ error: "Erro interno ao processar o comando de voz." }); // ✅ return adicionado
  }
});

export default router;

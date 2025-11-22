import { Router, Request, Response } from "express";
import voiceService from "../services/voice.service.js";
import authMiddleware from "../middleware/auth.middleware.js"; // ajuste o caminho se precisar

const router = Router();

router.post(
  "/process",
  authMiddleware.verifyToken, // middleware JWT roda antes da função
  async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Texto não fornecido." });
      }

      // Usuário já foi validado pelo middleware de JWT
      const user = (req as any).user;

      if (!user || !user.id || !user.groupId) {
        return res
          .status(401)
          .json({ error: "Usuário não autenticado ou dados ausentes no request." });
      }

      const userId = user.id;
      const groupId = user.groupId;

      // Extrai o token bruto do header (sem revalidar)
      const authHeader = req.headers.authorization as string | undefined;
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : undefined;

      const result = await voiceService.handleVoiceCommand(
        text,
        userId,
        groupId,
        token
      );

      console.log("Retorno VoiceService →", JSON.stringify(result, null, 2));
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Erro em /voice/process:", error.message || error);
      return res
        .status(500)
        .json({ error: "Erro interno ao processar o comando de voz." });
    }
  }
);

export default router;

import { Request, Response } from "express";
import { GamesService } from "../services/games.service";
import { IGames } from "../types/database";

export class GamesController {
  private gamesService: GamesService;

  constructor() {
    this.gamesService = new GamesService();
  }

  /** Criar jogo manualmente */
  createGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const created_by = (req as any).user?.id;

      const gameData: Omit<IGames, "id" | "created_at" | "modified_at"> = {
        ...req.body,
        created_by,
        modified_by: created_by,
      };

      if (!gameData.name || !gameData.group_id) {
        res.status(400).json({ error: "Campos obrigatórios: name, group_id" });
        return;
      }

      const game = await this.gamesService.createGame(gameData);
      res.status(201).json(game);
    } catch (error: any) {
      console.error("Erro ao criar game:", error);
      res
        .status(500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  };

  /** Buscar por ID */
  getGameById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const game = await this.gamesService.getGameById(Number(id));
      if (!game) {
        res.status(404).json({ error: "Game não encontrado" });
        return;
      }
      res.json(game);
    } catch (error: any) {
      console.error("Erro ao buscar game:", error);
      res
        .status(500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  };

  /** Buscar todos */
  getAllGames = async (_req: Request, res: Response): Promise<void> => {
    try {
      const games = await this.gamesService.getAllGames();
      res.json(games);
    } catch (error: any) {
      console.error("Erro ao buscar games:", error);
      res
        .status(500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  };

  /** Atualizar */
  updateGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: Partial<IGames> = req.body;
      const updatedGame = await this.gamesService.updateGame(
        Number(id),
        updateData
      );

      if (!updatedGame) {
        res.status(404).json({ error: "Game não encontrado" });
        return;
      }
      res.json(updatedGame);
    } catch (error: any) {
      console.error("Erro ao atualizar game:", error);
      res
        .status(500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  };

  /** Deletar */
  deleteGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.gamesService.deleteGame(Number(id));

      if (!success) {
        res.status(404).json({ error: "Game não encontrado" });
        return;
      }
      res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar game:", error);
      res
        .status(500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  };

  /** Adicionar jogo direto da IGDB */
  addFromIGDB = async (req: Request, res: Response): Promise<void> => {
    try {
      const created_by = (req as any).user?.id;
      const { id } = req.params;
      const { group_id } = req.body;

      if (!group_id) {
        res.status(400).json({ error: "O campo group_id é obrigatório" });
        return;
      }

      const savedGame = await this.gamesService.addGameFromIGDB(
        Number(id),
        Number(group_id),
        created_by
      );

      res.status(201).json(savedGame);
    } catch (error: any) {
      console.error("Erro ao adicionar jogo da IGDB:", error);
      res
        .status(500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  };
}

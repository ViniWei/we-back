import { GamesRepository } from "../repositories/games.repository";
import { IGames } from "../types/database";
import igdbRepository from "../api/igdb/igdb.repository";

export class GamesService {
  private gamesRepository: GamesRepository;

  constructor() {
    this.gamesRepository = new GamesRepository();
  }

  /** Criar jogo manualmente */
  async createGame(
    gameData: Omit<IGames, "id" | "created_at" | "modified_at">
  ): Promise<IGames> {
    if (!gameData.name || !gameData.group_id) {
      throw new Error("Campos obrigatórios: name, group_id");
    }

    const processedData = {
      ...gameData,
      platforms:
        (gameData as any).platforms ?? (gameData as any).platform ?? null,
    } as any;

    delete processedData.platform;

    return await this.gamesRepository.create(processedData);
  }

  /** Buscar por ID */
  async getGameById(id: number): Promise<IGames | null> {
    const game = await this.gamesRepository.getById(id);
    if (!game) return null;

    return { ...game } as IGames;
  }

  /** Buscar todos */
  async getAllGames(): Promise<IGames[]> {
    const games = await this.gamesRepository.getAll();
    return games as IGames[];
  }

  /** Atualizar */
  async updateGame(id: number, data: Partial<IGames>): Promise<IGames | null> {
    if (!id) throw new Error("ID é obrigatório");

    const processedData = {
      ...data,
      platforms: (data as any).platforms ?? (data as any).platform ?? null,
    } as any;

    delete processedData.platform;

    const updated = await this.gamesRepository.update(id, processedData);
    if (!updated) return null;

    return { ...updated } as IGames;
  }

  /** Deletar */
  async deleteGame(id: number): Promise<boolean> {
    if (!id) throw new Error("ID é obrigatório");
    return await this.gamesRepository.deleteById(id);
  }

  /** Adicionar direto da IGDB */
  async addGameFromIGDB(
    igdbId: number,
    group_id: number,
    created_by?: number
  ): Promise<IGames> {
    const gameFromIGDB = await igdbRepository.getGameById(igdbId);
    if (!gameFromIGDB) throw new Error("Jogo não encontrado na IGDB");

    if (!created_by) throw new Error("Usuário criador não identificado");

    // 🔍 Verifica se o usuário já adicionou esse jogo antes
    const userGames = await this.gamesRepository.getAllByField("created_by", created_by);
    const alreadyExists = userGames.some((g: any) => g.igdb_id === igdbId);

    if (alreadyExists) {
      throw new Error("Você já adicionou este jogo à sua lista.");
    }

    const gameData: Omit<IGames, "id" | "created_at" | "modified_at"> = {
      name: gameFromIGDB.name,
      group_id,
      platforms: gameFromIGDB.platforms.join(", "),
      cover_url: gameFromIGDB.cover_url,
      igdb_id: gameFromIGDB.id,
      status_id: 1,
      link: null,
      comment: null,
      created_by,
      modified_by: created_by,
    } as any;

    const saved = await this.gamesRepository.create(gameData);
    return { ...saved } as IGames;
  }
}

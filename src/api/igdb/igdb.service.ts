import igdbRepository, { Game } from "./igdb.repository";

class IgdbService {
  async searchGames(query: string, page: number, pageSize: number): Promise<Game[]> {
    return await igdbRepository.searchGames(query, page, pageSize);
  }

  async getGameById(id: string): Promise<Game | null> {
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) throw new Error("Invalid id");
    return await igdbRepository.getGameById(idNum);
  }
}

export default new IgdbService();

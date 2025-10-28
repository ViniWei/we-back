import { Request, Response } from "express";
import igdbService from "./igdb.service";

class IgdbController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { query, page = "1", pageSize = "10" } = req.query;
      if (!query) {
        res.status(400).json({ error: "query required" });
        return;
      }
      const q = String(query);
      const p = parseInt(String(page), 10) || 1;
      const ps = parseInt(String(pageSize), 10) || 10;
      const results = await igdbService.searchGames(q, p, ps);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "error" });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const game = await igdbService.getGameById(id);
      if (!game) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.json(game);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "error" });
    }
  }
}

export default new IgdbController();

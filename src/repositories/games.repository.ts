import BaseRepository from "./base.repository";
import { IGames } from "../types/database";

export class GamesRepository extends BaseRepository<IGames> {
  constructor() {
    super("games");
  }

  override async create(
    data: Omit<IGames, "id" | "created_at" | "modified_at">
  ): Promise<IGames> {
    const processedData = {
      ...data,
      created_at: new Date(),
      modified_at: new Date(),
    };

    return super.create(processedData as any);
  }

  override async getAll(): Promise<IGames[]> {
    return super.getAll();
  }

  override async getAllByField(field: string, value: any): Promise<IGames[]> {
    return super.getAllByField(field, value);
  }

  async getById(id: number): Promise<IGames | null> {
    const game = await super.getFirstByField("id", id);
    return game ?? null;
  }

  async update(id: number, data: Partial<IGames>): Promise<IGames | null> {
    const updateData = {
      ...data,
      modified_at: new Date(),
    };

    await this.updateAllByField("id", id, updateData as any);
    return await this.getById(id);
  }

  async deleteById(id: number): Promise<boolean> {
    const beforeDelete = await this.getById(id);
    if (!beforeDelete) return false;

    await super.deleteAllByField("id", id);
    return true;
  }
}

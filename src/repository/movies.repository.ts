import BaseRepository from "./BaseRepository.js";
import { IMovies } from "../types/database.js";

const tableName = "movies";
const baseRepository = new BaseRepository<IMovies>(tableName);

const getAll = async (): Promise<IMovies[]> => {
  return await baseRepository.getAll();
};

const getById = async (id: number): Promise<IMovies | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const getByApiId = async (apiId: string): Promise<IMovies | undefined> => {
  return await baseRepository.getFirstByField("api_id", apiId);
};

const create = async (
  movieData: Omit<IMovies, "id" | "created_at">
): Promise<IMovies> => {
  return await baseRepository.create(movieData);
};

const update = async (
  id: number,
  movieData: Partial<IMovies>
): Promise<void> => {
  return await baseRepository.updateAllByField("id", id, movieData);
};

const deleteById = async (id: number): Promise<void> => {
  return await baseRepository.deleteAllByField("id", id);
};

export default {
  getAll,
  getById,
  getByApiId,
  create,
  update,
  deleteById,
};

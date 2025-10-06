import BaseRepository from "./BaseRepository.js";
import { IMovieLists } from "../types/database.js";

const tableName = "movie_lists";
const baseRepository = new BaseRepository<IMovieLists>(tableName);

const getAll = async (): Promise<IMovieLists[]> => {
  return await baseRepository.getAll();
};

const getById = async (id: number): Promise<IMovieLists | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const getByGroupId = async (groupId: number): Promise<IMovieLists[]> => {
  return await baseRepository.getAllByField("group_id", groupId);
};

const create = async (
  listData: Omit<IMovieLists, "id" | "created_at">
): Promise<IMovieLists> => {
  return await baseRepository.create(listData);
};

const update = async (
  id: number,
  listData: Partial<IMovieLists>
): Promise<void> => {
  return await baseRepository.updateAllByField("id", id, listData);
};

const deleteById = async (id: number): Promise<void> => {
  return await baseRepository.deleteAllByField("id", id);
};

export default {
  getAll,
  getById,
  getByGroupId,
  create,
  update,
  deleteById,
};

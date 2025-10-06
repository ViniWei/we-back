import BaseRepository from "./BaseRepository";
import { IFinances } from "../types/database";

const tableName = "finances";
const baseRepository = new BaseRepository<IFinances>(tableName);

const getAll = async (): Promise<IFinances[]> => {
  return await baseRepository.getAll();
};

const getById = async (id: number): Promise<IFinances | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const getByGroupId = async (groupId: number): Promise<IFinances[]> => {
  return await baseRepository.getAllByField("group_id", groupId);
};

const create = async (
  financeData: Omit<IFinances, "id" | "created_at" | "modified_at">
): Promise<IFinances> => {
  return await baseRepository.create(financeData);
};

const update = async (
  id: number,
  financeData: Partial<IFinances>
): Promise<void> => {
  return await baseRepository.updateAllByField("id", id, financeData);
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

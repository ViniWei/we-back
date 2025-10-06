import BaseRepository from "./BaseRepository";
import {
  IUserGroups,
  CreateUserGroup,
  UpdateUserGroup,
} from "../types/database";

const tableName = "user_groups";
const baseRepository = new BaseRepository<IUserGroups>(tableName);

const create = async (groupData: CreateUserGroup): Promise<IUserGroups> => {
  return await baseRepository.create(groupData);
};

const getById = async (id: number): Promise<IUserGroups | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const getByUserId = async (
  userId: number
): Promise<IUserGroups | undefined> => {
  return await baseRepository.getFirstByField("user_id", userId);
};

const getAll = async (): Promise<IUserGroups[]> => {
  return await baseRepository.getAll();
};

const update = async (
  id: number,
  fieldsToUpdate: UpdateUserGroup
): Promise<void> => {
  return await baseRepository.updateAllByField("id", id, fieldsToUpdate);
};

export default {
  create,
  getById,
  getByUserId,
  getAll,
  update,
};

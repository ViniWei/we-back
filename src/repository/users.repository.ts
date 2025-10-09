import BaseRepository from "./BaseRepository";
import { IUser, CreateUser, UpdateUser } from "../types/database";

const tableName = "users";
const baseRepository = new BaseRepository<IUser>(tableName);

const getAll = async (): Promise<IUser[]> => {
  return await baseRepository.getAll();
};

const getById = async (id: number): Promise<IUser | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const getByEmail = async (email: string): Promise<IUser | undefined> => {
  return await baseRepository.getFirstByField("email", email);
};

const getByGroupId = async (groupId: number): Promise<IUser[]> => {
  return await baseRepository.getAllByField("group_id", groupId);
};

const deleteAllById = async (id: number): Promise<void> => {
  return await baseRepository.deleteAllByField("id", id);
};

const create = async (usuario: CreateUser): Promise<IUser> => {
  return await baseRepository.create(usuario);
};

const update = async (
  field: string,
  value: any,
  user: UpdateUser
): Promise<void> => {
  return await baseRepository.updateAllByField(field, value, user);
};

export default {
  getAll,
  getById,
  getByEmail,
  getByGroupId,
  create,
  deleteAllById,
  update,
};

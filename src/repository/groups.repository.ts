import BaseRepository from "./BaseRepository.js";

interface IGroup {
  id?: number;
  [key: string]: any;
}

const tableName = "groups";
const baseRepository = new BaseRepository<IGroup>(tableName);

const getAll = async (): Promise<IGroup[]> => {
  return await baseRepository.getAll();
};

const get = async (id: number): Promise<IGroup | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

export default {
  getAll,
  get,
};

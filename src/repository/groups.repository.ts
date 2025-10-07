import BaseRepository from "./BaseRepository";

interface IGroup {
  id?: number;
  active?: boolean;
  created_at?: Date;
}

const tableName = "groups";
const baseRepository = new BaseRepository<IGroup>(tableName);

const getAll = async (): Promise<IGroup[]> => {
  return await baseRepository.getAll();
};

const get = async (id: number): Promise<IGroup | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const create = async (): Promise<IGroup> => {
  return await baseRepository.create({
    active: true,
  });
};

export default {
  getAll,
  get,
  create,
};

import BaseRepository from "./BaseRepository.js";

const tableName = "finances";
const baseRepository = new BaseRepository(tableName);

const getById = async (id) => { return await baseRepository.getFirstByField("id", id); };
const getAllByCouple = async (coupleId) => { return await baseRepository.getAllByField("couple_id", coupleId); };
const create = async (finance) => { return await baseRepository.create(finance); };
const update = async (id, finance) => { return await baseRepository.updateAllByField("id", id, finance); };
const remove = async (id) => { return await baseRepository.deleteAllByField("id", id); };

export default {
  getById,
  getAllByCouple,
  update,
  create,
  remove,
};

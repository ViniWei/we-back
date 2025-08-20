import BaseRepository from "./BaseRepository.js";

const tableName = "expenses";
const baseRepository = new BaseRepository(tableName);

const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const getAllByCouple = async(coupleId) => { return await baseRepository.getAllByField("couple_id", coupleId); };
const create = async(expense) => { return await baseRepository.create(expense) };
const update = async(id, expense) => { return await baseRepository.updateAllByField("id", id, expense) };
const remove = async(id) => { return await baseRepository.deleteAllByField("id", id); };

export default {
    getById,
    getAllByCouple,
    update,
    create,
    remove
};
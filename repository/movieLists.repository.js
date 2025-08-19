import BaseRepository from "./BaseRepository.js";

const tableName = "movie_lists";
const baseRepository = new BaseRepository(tableName);

const getAll = async() => { return await baseRepository.getAll(); };
const getListsByCouple = async(coupleId) => { return await baseRepository.getAllByField("couple_id", coupleId); };
const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const create = async(list) => { return await baseRepository.create(list); };
const update = async(field, value, list) => { return await baseRepository.updateAllByField(field, value, list); };
const deleteList = async(listId) => { return await baseRepository.deleteAllByField("id", listId); };

export default {
    getAll,
    getListsByCouple,
    getById,
    create,
    update,
    deleteList
};
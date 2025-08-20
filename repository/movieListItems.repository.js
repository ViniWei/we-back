import BaseRepository from "./BaseRepository.js";

const tableName = "movie_list_items";
const baseRepository = new BaseRepository(tableName);

const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const addToList = async(item) => { return await baseRepository.create(item); };
const removeFromList = async(recordId) => { return await baseRepository.deleteAllByField("id", recordId); };
const deleteAllFromList = async(listId) => { return await baseRepository.deleteAllByField("list_id", listId); };

export default {
    getById,
    addToList,
    removeFromList,
    deleteAllFromList
};
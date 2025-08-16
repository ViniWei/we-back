import BaseRepository from "./BaseRepository.js";

const tableName = "movie_lists";
const baseRepository = new BaseRepository(tableName);

const getListsByCouple = async(coupleId) => { return await baseRepository.getAllByField("couple_id", coupleId); };
const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const create = async(movie) => { return await baseRepository.create(movie); };
const deleteList = async(listId) => { return await baseRepository.deleteAllByField("id", listId); };

export default {
    getListsByCouple,
    getById,
    create,
    deleteList
};
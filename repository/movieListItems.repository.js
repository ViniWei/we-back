import BaseRepository from "./BaseRepository.js";

const tableName = "movie_list_items";
const baseRepository = new BaseRepository(tableName);

const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const create = async(item) => { return await baseRepository.create(item); };
const deleteAllFromList = async(listId) => { return await baseRepository.deleteAllByField("list_id", listId); };

const removeFromList = async(listId, movieId) => {
    const result = await pool.query("DELETE FROM movie_list_items WHERE listId = ? AND movie_id = ?", [listId, movieId]);

    return result[0];
};

export default {
    getById,
    create,
    deleteAllFromList,
    removeFromList
};
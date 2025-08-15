import BaseRepository from "./BaseRepository.js";

const tableName = "movie_lists";
const baseRepository = new BaseRepository(tableName);

const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const create = async(movie) => { return await baseRepository.create(movie); };

const getListsByCouple = async(coupleId) => { 
    const result = await pool.query("SELECT * FROM movie_lists WHERE couple_id = ?", [coupleId]);

    return result[0];
};

const deleteList = async(listId) => {
    await baseRepository.deleteAllByField("id", listId);
};

export default {
    getById,
    create,
    getListsByCouple,
    deleteList
};
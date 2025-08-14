import BaseRepository from "./BaseRepository.js";

const tableName = "movie_lists";
const baseRepository = new BaseRepository(tableName);

const getAll = async() => { return await baseRepository.getAll(); };
const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const create = async(movie) => { return await baseRepository.create(movie); };

const getListsByCouple = async(coupleId) => { 
    const result = await pool.query("SELECT * FROM movie_lists WHERE couple_id = ?", [coupleId]);

    return result[0];
};

const addMovieToList = async(listId, movieId) => {
    const query = "INSERT INTO movie_list_items (movieId, listId, data_adicionado) VALUES (?, ?, ?)";
    await pool.query(query, [listId, movieId, new Date().toISOString()]);
};

const getMoviesByListId = async(listId) => {
    const result = await pool.query("SELECT * FROM movie_list_items WHERE listId = ? JOIN movies", [listId]);

    return result[0];
};

const removeFromList = async(listId, movieId) => {
    const result = await pool.query("DELETE FROM movie_list_items WHERE listId = ? AND movie_id = ?", [listId, movieId]);

    return result[0];
};

const removeList = async(listId) => {
    await pool.query("DELETE FROM movie_list_items WHERE listId = ?", [listId]);
    await pool.query("DELETE FROM movie_lists WHERE id = ?", [listId]);
};

export default {
    getAll,
    getById,
    create,
    getListsByCouple,
    addMovieToList,
    getMoviesByListId,
    removeFromList,
    removeList
};
import BaseRepository from "./BaseRepository.js";
import { pool } from "../db.js";

const tableName = "movies";
const baseRepository = new BaseRepository(tableName);

const getAll = async() => { return await baseRepository.getAll(); };
const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const getByApiId = async (apiId) => { return await baseRepository.getFirstByField("api_id", apiId); };
const create = async(movie) => { return await baseRepository.create(movie); };

const getListsWithMoviesByCouple = async(coupleId) => {
    const [rows] = await pool.query(
        `SELECT 
            ml.id AS list_id,
            ml.name AS list_name,
            mli.id AS movie_id,
            m.title AS movie_title,
            m.synopsis,
            m.poster_path,
            mli.created_at AS added_at
        FROM movie_lists ml
        INNER JOIN movie_list_items mli ON ml.id = mli.list_id
        INNER JOIN movies m ON mli.movie_id = m.id
        WHERE ml.couple_id = ?
        ORDER BY ml.id, mli.created_at`,
        [coupleId]
    );

    const result = {};
    rows.forEach(row => {
        if (!result[row.list_id]) {
            result[row.list_id] = {
                id: row.list_id,
                name: row.list_name,
                movies: []
            };
        }
        result[row.list_id].movies.push({
            id: row.movie_id,
            title: row.movie_title,
            synopsis: row.synopsis,
            poster_path: row.poster_path,
            added_at: row.added_at
        });
    });

    return Object.values(result);
};

export default {
    getAll,
    getById,
    getByApiId,
    create,
    getListsWithMoviesByCouple
};

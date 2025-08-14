import BaseRepository from "./BaseRepository.js";

const tableName = "movies";
const baseRepository = new BaseRepository(tableName);

const getAll = async() => { return await baseRepository.getAll(); };
const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const create = async(movie) => { return await baseRepository.create(movie); };

export default {
    getAll,
    getById,
    create
};

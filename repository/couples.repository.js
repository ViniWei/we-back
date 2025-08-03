import BaseRepository from "./BaseRepository.js";

const tableName = "couples";
const baseRepository = new BaseRepository(tableName);

const getAll = async() => { return await baseRepository.getAll(); };
const get = async(id) => { return await baseRepository.getFirstByField("id", id); };

export default {
    getAll,
    get
};

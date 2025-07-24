import BaseRepository from "./BaseRepository.js";

const tableName = "casais";
const baseRepository = new BaseRepository(tableName);

const getAll = async() => { return await baseRepository.getAll(); };
const get = async(id) => { return await baseRepository.getFirstByField("id", id); };

export default {
    getAll,
    get
};

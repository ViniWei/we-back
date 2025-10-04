import BaseRepository from "./BaseRepository.js";

const tableName = "groups";
const baseRepository = new BaseRepository(tableName);

const getAll = async () => {
    return await baseRepository.getAll();
};
const get = async (id) => {
    return await baseRepository.getFirstByField("id", id);
};

export default {
    getAll,
    get,
};

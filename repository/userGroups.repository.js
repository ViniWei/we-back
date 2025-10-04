import BaseRepository from "./BaseRepository.js";

const tableName = "user_groups";
const baseRepository = new BaseRepository(tableName);

const create = async (groupData) => {
    return await baseRepository.create(groupData);
};

const getById = async (id) => {
    return await baseRepository.getFirstByField("id", id);
};

const getAll = async () => {
    return await baseRepository.getAll();
};

const update = async (id, fieldsToUpdate) => {
    return await baseRepository.updateAllByField("id", id, fieldsToUpdate);
};

export default {
    create,
    getById,
    getAll,
    update,
};

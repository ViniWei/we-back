import BaseRepository from "./BaseRepository.js";

const tableName = "finances";
const baseRepository = new BaseRepository(tableName);

const getById = async (id) => {
    return await baseRepository.getFirstByField("id", id);
};
const getAllByGroup = async (groupId) => {
    return await baseRepository.getAllByField("group_id", groupId);
};
const create = async (finance) => {
    return await baseRepository.create(finance);
};
const update = async (id, finance) => {
    return await baseRepository.updateAllByField("id", id, finance);
};
const remove = async (id) => {
    return await baseRepository.deleteAllByField("id", id);
};

export default {
    getById,
    getAllByGroup,
    update,
    create,
    remove,
};

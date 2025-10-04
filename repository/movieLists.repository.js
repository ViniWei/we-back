import BaseRepository from "./BaseRepository.js";

const tableName = "movie_lists";
const baseRepository = new BaseRepository(tableName);

const getAll = async () => {
    return await baseRepository.getAll();
};
const getListsByGroup = async (groupId) => {
    return await baseRepository.getAllByField("group_id", groupId);
};
const getById = async (id) => {
    return await baseRepository.getFirstByField("id", id);
};
const create = async (list) => {
    return await baseRepository.create(list);
};
const update = async (field, value, list) => {
    return await baseRepository.updateAllByField(field, value, list);
};
const deleteList = async (listId) => {
    return await baseRepository.deleteAllByField("id", listId);
};

export default {
    getAll,
    getListsByGroup,
    getById,
    create,
    update,
    deleteList,
};

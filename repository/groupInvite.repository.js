import BaseRepository from "./BaseRepository.js";

const tableName = "group_invite";
const baseRepository = new BaseRepository(tableName);

const create = async (inviteData) => {
    return await baseRepository.create(inviteData);
};

const getByCode = async (code) => {
    return await baseRepository.getFirstByField("code", code);
};

const getById = async (id) => {
    return await baseRepository.getFirstByField("id", id);
};

const getByCreatorUserId = async (creatorUserId) => {
    return await baseRepository.getFirstByField("creator_user_id", creatorUserId);
};

const update = async (id, fieldsToUpdate) => {
    return await baseRepository.updateAllByField("id", id, fieldsToUpdate);
};

const getAll = async () => {
    return await baseRepository.getAll();
};

export default {
    create,
    getByCode,
    getById,
    getByCreatorUserId,
    update,
    getAll,
};

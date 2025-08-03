import BaseRepository from "./BaseRepository.js";

const tableName = "users";
const baseRepository = new BaseRepository(tableName);

const getAll = async() => { return await baseRepository.getAll(); };
const getById = async(id) => { return await baseRepository.getFirstByField("id", id); };
const getByEmail = async(email) => { return await baseRepository.getFirstByField("email", email); };
const deleteAllById = async(id) => { return await baseRepository.deleteAllByField("id", id); };
const create = async(usuario) => { return await baseRepository.create(usuario); };
const update = async(field, value, user) => { return await baseRepository.updateAllByField(field, value, user); };

export default {
    getAll,
    getById,
    getByEmail,
    create,
    deleteAllById,
    update
};

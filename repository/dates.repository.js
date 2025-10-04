import BaseRepository from "./BaseRepository.js";

const baseRepository = new BaseRepository("dates");

async function create(date) {
    return baseRepository.create(date);
}

async function getById(id) {
    return baseRepository.getFirstByField("id", id);
}

async function getAllByUserGroup(user_group) {
    return baseRepository.getAllByField("group_id", user_group);
}

async function remove(id) {
    return baseRepository.deleteAllByField("id", id);
}

export default {
    create,
    getAllByUserGroup,
    remove,
    getById
};

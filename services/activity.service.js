import activityRepository from "../repository/activity.repository.js";

const getAll = async () => {
  return await activityRepository.getAll();
};

const getById = async (id) => {
  if (!id) throw new Error("ID is required");
  return await activityRepository.get(id);
};

const create = async (data) => {
  if (!data.event_name || !data.couple_id || !data.event_date || !data.event_time) {
    throw new Error("Missing required fields: event_name, couple_id, event_date, event_time");
  }
  return await activityRepository.create(data);
};

const update = async (id, data) => {
  if (!id) throw new Error("ID is required");
  return await activityRepository.update(id, data);
};

const deleteById = async (id) => {
  if (!id) throw new Error("ID is required");
  return await activityRepository.deleteById(id);
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteById
};

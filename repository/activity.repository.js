import BaseRepository from "./BaseRepository.js";
import { pool } from "../db.js";

const tableName = "activity";
const baseRepository = new BaseRepository(tableName);

const getAll = async () => baseRepository.getAll();
const getById = async (id) => baseRepository.getFirstByField("id", id);
const create = async (activity) => {
  return await baseRepository.create({
    couple_id: activity.couple_id,
    event_name: activity.event_name,
    event_date: activity.event_date,
    event_time: activity.event_time,
    location: activity.location || null,
    description: activity.description || null,
    created_by: activity.created_by || null,
    created_at: new Date(),
  });
};
const update = async (id, activity) => {
  const fields = [];
  const values = [];

  for (const key in activity) {
    if (activity[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(activity[key]);
    }
  }

  fields.push("modified_at = ?");
  values.push(new Date());
  values.push(id);

  const query = `UPDATE ${tableName} SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

const deleteById = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteById, 
};

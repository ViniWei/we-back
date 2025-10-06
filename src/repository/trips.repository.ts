import { pool } from "../config/database";
import BaseRepository from "./BaseRepository";
import { ITrip, ITripWithPhotos, ITripPhoto } from "../types/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const tableName = "trips";
const baseRepository = new BaseRepository(tableName);

const getTripsWithPhotos = async (
  whereClause = "",
  groupId?: number
): Promise<ITripWithPhotos[]> => {
  let finalWhereClause = whereClause;

  // Add group filter if groupId is provided
  if (groupId) {
    const groupFilter = `t.group_id = ${pool.escape(groupId)}`;
    if (whereClause && whereClause.trim() !== "") {
      finalWhereClause = `${whereClause} AND ${groupFilter}`;
    } else {
      finalWhereClause = `WHERE ${groupFilter}`;
    }
  }

  const query = `
        SELECT 
            t.id,
            t.destination as city,
            t.start_date,
            t.end_date,
            t.description,
            t.budget as estimated_budget,
            ts.status,
            t.created_at,
            t.modified_at as updated_at,
            GROUP_CONCAT(tp.photo_url) AS photos
        FROM 
            trips t
        LEFT JOIN 
            trip_photos tp ON t.id = tp.trip_id
        LEFT JOIN 
            trip_status ts ON t.status_id = ts.id
        ${finalWhereClause}
        GROUP BY 
            t.id
        ORDER BY
            t.start_date DESC;
    `;

  const [rows] = await pool.query<RowDataPacket[]>(query);

  return rows.map((row) => ({
    id: row.id,
    city: row.city,
    start_date: row.start_date,
    end_date: row.end_date,
    description: row.description,
    estimated_budget: row.estimated_budget,
    status: translateStatus(row.status || "planned"),
    created_at: row.created_at,
    updated_at: row.updated_at,
    photos: row.photos ? row.photos.split(",") : [],
  })) as ITripWithPhotos[];
};

// Helper function to translate status from English to Portuguese
const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    planned: "Planejando",
    ongoing: "Em andamento",
    finished: "Finalizada",
    canceled: "Cancelada",
    cancelled: "Cancelada",
  };

  return statusMap[status.toLowerCase()] || "Planejando";
};

const getByIdWithPhotos = async (
  id: number | string,
  groupId?: number
): Promise<ITripWithPhotos | null> => {
  const trips = await getTripsWithPhotos(
    `WHERE t.id = ${pool.escape(id)}`,
    groupId
  );
  return trips.length > 0 ? trips[0] : null;
};

const getAll = async (groupId?: number): Promise<ITripWithPhotos[]> => {
  return await getTripsWithPhotos("", groupId);
};

const getUpcoming = async (groupId?: number): Promise<ITripWithPhotos[]> => {
  return await getTripsWithPhotos("WHERE t.end_date >= CURDATE()", groupId);
};

const getPast = async (groupId?: number): Promise<ITripWithPhotos[]> => {
  return await getTripsWithPhotos("WHERE t.end_date < CURDATE()", groupId);
};

const create = async (
  trip: Omit<ITrip, "id" | "created_at" | "updated_at">,
  groupId?: number
): Promise<ITrip> => {
  // Map from frontend format to database format
  const tripData: Record<string, any> = {
    destination: trip.city,
    start_date: trip.start_date,
    end_date: trip.end_date,
    description: trip.description,
    budget: trip.estimated_budget,
    status_id: await getStatusId(trip.status),
    group_id: groupId, // Add group_id to trip
    created_at: new Date(),
    modified_at: new Date(),
  };

  const result = await baseRepository.create(tripData);
  return (await getByIdWithPhotos(result.id, groupId)) as ITrip;
};

const update = async (
  id: number | string,
  trip: Partial<ITrip>,
  groupId?: number
): Promise<ITripWithPhotos | null> => {
  // Map from frontend format to database format
  const tripData: Record<string, any> = {};

  if (trip.city) tripData.destination = trip.city;
  if (trip.start_date) tripData.start_date = trip.start_date;
  if (trip.end_date) tripData.end_date = trip.end_date;
  if (trip.description !== undefined) tripData.description = trip.description;
  if (trip.estimated_budget !== undefined)
    tripData.budget = trip.estimated_budget;
  if (trip.status) tripData.status_id = await getStatusId(trip.status);

  tripData.modified_at = new Date();

  await baseRepository.updateAllByField("id", id, tripData);
  return await getByIdWithPhotos(id, groupId);
};

// Helper function to get status_id from status name
const getStatusId = async (status: string): Promise<number> => {
  const statusMap: Record<string, number> = {
    Planejando: 1,
    "Em andamento": 2,
    Finalizada: 3,
    Cancelada: 4,
    planejando: 1,
    "em-andamento": 2,
    concluida: 3,
    cancelada: 4,
    planned: 1,
    ongoing: 2,
    finished: 3,
    canceled: 4,
    cancelled: 4,
  };

  return statusMap[status] || 1; // Default to 'planned'
};

const remove = async (id: number | string): Promise<ResultSetHeader> => {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM ${tableName} WHERE id = ?`,
    [id]
  );
  return result;
};

const addPhotos = async (
  tripId: number | string,
  photoUrls: string[]
): Promise<ResultSetHeader | null> => {
  if (!photoUrls || photoUrls.length === 0) return null;

  const values = photoUrls.map((url) => [tripId, url]);
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO trip_photos (trip_id, photo_url) VALUES ?",
    [values]
  );
  return result;
};

export default {
  getAll,
  getById: getByIdWithPhotos,
  getUpcoming,
  getPast,
  create,
  update,
  remove,
  addPhotos,
};

// src/repositories/trips.repository.ts
import { eq, and } from "drizzle-orm";
import { db, pool } from "../db";
import { trips, tripPhotos } from "../db/schema";
import { ITrips, ITripWithPhotos } from "../types/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const toSnakeCase = (data: any): ITrips => ({
  id: data.id,
  group_id: data.groupId,
  destination: data.destination,
  start_date: data.startDate,
  end_date: data.endDate,
  budget: data.budget,
  description: data.description,
  status_id: data.statusId,
  created_by: data.createdBy,
  modified_by: data.modifiedBy,
  created_at: data.createdAt,
  modified_at: data.modifiedAt,
});

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

const getTripsWithPhotos = async (
  whereClause = "",
  groupId?: number
): Promise<ITripWithPhotos[]> => {
  let finalWhereClause = whereClause;

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
      t.destination AS city,
      t.start_date,
      t.end_date,
      t.description,
      t.budget AS estimated_budget,
      ts.status,
      t.created_at,
      t.modified_at AS updated_at,
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

const getAll = async (groupId?: number): Promise<ITripWithPhotos[]> => {
  return await getTripsWithPhotos("", groupId);
};

const getAllByGroupId = async (groupId: number): Promise<ITrips[]> => {
  const result = await db.select().from(trips).where(eq(trips.groupId, groupId));
  return result.map(toSnakeCase);
};

const getById = async (
  id: number,
  groupId?: number
): Promise<ITripWithPhotos | null> => {
  const whereClause = groupId
    ? `WHERE t.id = ${pool.escape(id)} AND t.group_id = ${pool.escape(groupId)}`
    : `WHERE t.id = ${pool.escape(id)}`;
  const tripsResult = await getTripsWithPhotos(whereClause);
  return tripsResult.length > 0 ? tripsResult[0] : null;
};

const getUpcoming = async (groupId?: number): Promise<ITripWithPhotos[]> => {
  return await getTripsWithPhotos("WHERE t.end_date >= CURDATE()", groupId);
};

const getPast = async (groupId?: number): Promise<ITripWithPhotos[]> => {
  return await getTripsWithPhotos("WHERE t.end_date < CURDATE()", groupId);
};

const create = async (data: Partial<ITrips>): Promise<ITrips> => {
  const now = new Date();
  const result = await db.insert(trips).values({
    groupId: data.group_id,
    destination: data.destination,
    startDate: data.start_date,
    endDate: data.end_date,
    budget: data.budget,
    description: data.description,
    statusId: data.status_id,
    createdBy: data.created_by,
    modifiedBy: data.modified_by,
    createdAt: data.created_at || now,
    modifiedAt: data.modified_at || now,
  });
  const insertId = Number(result[0].insertId);
  const [newTrip] = await db.select().from(trips).where(eq(trips.id, insertId));
  return toSnakeCase(newTrip);
};

const update = async (
  id: number,
  data: Partial<ITrips>,
  groupId?: number
): Promise<ITripWithPhotos | null> => {
  const updateData: any = {};
  if (data.destination !== undefined) updateData.destination = data.destination;
  if (data.start_date !== undefined) updateData.startDate = data.start_date;
  if (data.end_date !== undefined) updateData.endDate = data.end_date;
  if (data.budget !== undefined) updateData.budget = data.budget;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status_id !== undefined) updateData.statusId = data.status_id;
  if (data.modified_by !== undefined) updateData.modifiedBy = data.modified_by;
  updateData.modifiedAt = new Date();

  const whereCondition = groupId
    ? and(eq(trips.id, id), eq(trips.groupId, groupId))
    : eq(trips.id, id);

  await db.update(trips).set(updateData).where(whereCondition!);
  return await getById(id, groupId);
};

const deleteById = async (id: number): Promise<void> => {
  await db.delete(trips).where(eq(trips.id, id));
};

const remove = async (id: number): Promise<boolean> => {
  await deleteById(id);
  return true;
};

const deleteAllByGroupId = async (groupId: number): Promise<void> => {
  await db.delete(trips).where(eq(trips.groupId, groupId));
};

const addPhotos = async (tripId: number, photoUrls: string[]): Promise<void> => {
  if (photoUrls.length === 0) return;

  const values = photoUrls.map((url) => ({
    tripId,
    photoUrl: url,
    createdAt: new Date(),
  }));

  await db.insert(tripPhotos).values(values);
};

const deletePhoto = async (tripId: number, photoUrl: string): Promise<void> => {
  await db
    .delete(tripPhotos)
    .where(and(eq(tripPhotos.tripId, tripId), eq(tripPhotos.photoUrl, photoUrl)));
};

const deleteByCity = async (groupId: number, city: string): Promise<boolean> => {
  const normalizedCity = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  const query = `
    DELETE FROM trips
    WHERE group_id = ?
      AND LOWER(TRIM(
        REPLACE(REPLACE(REPLACE(REPLACE(destination, 'á','a'),'ã','a'),'â','a'),'à','a')
      )) = ?
  `;

  const [result] = await pool.query<ResultSetHeader>(query, [groupId, normalizedCity]);
  return result.affectedRows > 0;
};

const deleteByDate = async (groupId: number, date: string): Promise<boolean> => {
  const query = `
    DELETE FROM trips
    WHERE group_id = ?
      AND (
        DATE(?) = DATE(start_date)
        OR DATE(?) = DATE(end_date)
        OR (DATE(?) BETWEEN DATE(start_date) AND DATE(end_date))
      )
  `;
  const [result] = await pool.query<ResultSetHeader>(query, [groupId, date, date, date]);
  return result.affectedRows > 0;
};

export default {
  getAll,
  getAllByGroupId,
  getById,
  getUpcoming,
  getPast,
  create,
  update,
  deleteById,
  remove,
  deleteAllByGroupId,
  addPhotos,
  deletePhoto,
  deleteByCity,
  deleteByDate,
};

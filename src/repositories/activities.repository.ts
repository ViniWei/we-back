import { eq } from "drizzle-orm";
import { db } from "../db";
import { activities } from "../db/schema";
import { IActivities } from "../types/database";

export interface IActivity {
  id?: number;
  group_id?: number;
  trip_id?: number;
  date_id?: number;
  event_name?: string;
  date: Date;
  created_by?: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
}

const toSnakeCase = (data: any): IActivities => ({
  id: data.id,
  group_id: data.groupId,
  trip_id: data.tripId,
  date_id: data.dateId,
  event_name: data.eventName,
  date: data.date,
  created_by: data.createdBy,
  modified_by: data.modifiedBy,
  created_at: data.createdAt,
  modified_at: data.modifiedAt,
});

const getAll = async (): Promise<IActivities[]> => {
  const results = await db.select().from(activities);
  return results.map(toSnakeCase);
};

const getAllByGroupId = async (groupId: number): Promise<IActivities[]> => {
  const results = await db
    .select()
    .from(activities)
    .where(eq(activities.groupId, groupId));
  return results.map(toSnakeCase);
};

const getAllByTripId = async (tripId: number): Promise<IActivities[]> => {
  const results = await db
    .select()
    .from(activities)
    .where(eq(activities.tripId, tripId));
  return results.map(toSnakeCase);
};

const getAllByDateId = async (dateId: number): Promise<IActivities[]> => {
  const results = await db
    .select()
    .from(activities)
    .where(eq(activities.dateId, dateId));
  return results.map(toSnakeCase);
};

const getById = async (id: number): Promise<IActivities | undefined> => {
  const result = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id));
  return result[0] ? toSnakeCase(result[0]) : undefined;
};

const create = async (data: Partial<IActivity>): Promise<IActivities> => {
  const now = new Date();

  let parsedDate = data.date;
  if (typeof data.date === "string") {
    parsedDate = new Date(data.date);
  }

  const result = await db.insert(activities).values({
    groupId: data.group_id,
    tripId: data.trip_id,
    dateId: data.date_id,
    eventName: data.event_name,
    date: parsedDate!,
    createdBy: data.created_by,
    modifiedBy: data.modified_by,
    createdAt: data.created_at || now,
    modifiedAt: data.modified_at || now,
  });
  const insertId = Number(result[0].insertId);
  const created = await getById(insertId);
  return created!;
};

const update = async (id: number, data: Partial<IActivity>) => {
  const updateData: any = {};
  if (data.event_name !== undefined) updateData.eventName = data.event_name;
  if (data.date !== undefined) updateData.date = data.date;
  if (data.trip_id !== undefined) updateData.tripId = data.trip_id;
  if (data.date_id !== undefined) updateData.dateId = data.date_id;
  if (data.modified_by !== undefined) updateData.modifiedBy = data.modified_by;
  updateData.modifiedAt = new Date();

  await db.update(activities).set(updateData).where(eq(activities.id, id));
};

const deleteById = async (id: number) => {
  await db.delete(activities).where(eq(activities.id, id));
};

const deleteAllByGroupId = async (groupId: number) => {
  await db.delete(activities).where(eq(activities.groupId, groupId));
};

const deleteAllByTripId = async (tripId: number) => {
  await db.delete(activities).where(eq(activities.tripId, tripId));
};

const deleteAllByDateId = async (dateId: number) => {
  await db.delete(activities).where(eq(activities.dateId, dateId));
};

export default {
  getAll,
  getAllByGroupId,
  getAllByTripId,
  getAllByDateId,
  getById,
  create,
  update,
  deleteById,
  deleteAllByGroupId,
  deleteAllByTripId,
  deleteAllByDateId,
};

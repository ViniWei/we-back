import { eq } from "drizzle-orm";
import { db } from "../db";
import { dates } from "../db/schema";
import { IDates } from "../types/database";

export interface IDate {
  id?: number;
  group_id: number;
  date: Date;
  location?: string;
  description?: string;
  status_id: number;
  created_by?: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
}

// Converter de camelCase (Drizzle) para snake_case (IDates)
const toSnakeCase = (data: any): IDates => ({
  id: data.id,
  group_id: data.groupId,
  date: data.date,
  location: data.location,
  description: data.description,
  status_id: data.statusId,
  created_by: data.createdBy,
  modified_by: data.modifiedBy,
  created_at: data.createdAt,
  modified_at: data.modifiedAt,
});

const getAll = async (): Promise<IDates[]> => {
  const results = await db.select().from(dates);
  return results.map(toSnakeCase);
};

const getAllByGroupId = async (groupId: number): Promise<IDates[]> => {
  const results = await db
    .select()
    .from(dates)
    .where(eq(dates.groupId, groupId));
  return results.map(toSnakeCase);
};

const getById = async (id: number): Promise<IDates | undefined> => {
  const result = await db.select().from(dates).where(eq(dates.id, id));
  return result[0] ? toSnakeCase(result[0]) : undefined;
};

const create = async (data: Partial<IDate>): Promise<IDates> => {
  const now = new Date();

  let parsedDate = data.date;
  if (typeof data.date === "string") {
    parsedDate = new Date(data.date);
  }

  const result = await db.insert(dates).values({
    groupId: data.group_id!,
    date: parsedDate!,
    location: data.location,
    description: data.description,
    statusId: data.status_id!,
    createdBy: data.created_by,
    modifiedBy: data.modified_by,
    createdAt: data.created_at || now,
    modifiedAt: data.modified_at || now,
  });
  const insertId = Number(result[0].insertId);
  const created = await getById(insertId);
  return created!;
};

const update = async (id: number, data: Partial<IDate>) => {
  const updateData: any = {};
  if (data.date !== undefined) updateData.date = data.date;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status_id !== undefined) updateData.statusId = data.status_id;
  if (data.modified_by !== undefined) updateData.modifiedBy = data.modified_by;
  updateData.modifiedAt = new Date();

  await db.update(dates).set(updateData).where(eq(dates.id, id));
};

const deleteById = async (id: number) => {
  await db.delete(dates).where(eq(dates.id, id));
};

const deleteAllByGroupId = async (groupId: number) => {
  await db.delete(dates).where(eq(dates.groupId, groupId));
};

export default {
  getAll,
  getAllByGroupId,
  getById,
  create,
  update,
  deleteById,
  deleteAllByGroupId,
};

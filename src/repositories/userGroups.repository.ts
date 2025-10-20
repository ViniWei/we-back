import { eq } from "drizzle-orm";
import { db } from "../db";
import { userGroups } from "../db/schema";

export interface IUserGroup {
  id?: number;
  active?: number;
  groupImagePath?: string;
  relationshipStartDate?: Date;
  created_at?: Date;
}

const getAll = async () => {
  return await db.select().from(userGroups);
};

const getById = async (id: number) => {
  const result = await db
    .select()
    .from(userGroups)
    .where(eq(userGroups.id, id));
  return result[0];
};

// Alias para compatibilidade
const get = getById;

const create = async (data?: Partial<IUserGroup>) => {
  const result = await db.insert(userGroups).values({
    active: data?.active ?? 1,
    groupImagePath: data?.groupImagePath,
    relationshipStartDate: data?.relationshipStartDate,
    createdAt: data?.created_at ? new Date(data.created_at) : new Date(),
  });
  const insertId = Number(result[0].insertId);
  return await getById(insertId);
};

const deleteById = async (id: number) => {
  await db.delete(userGroups).where(eq(userGroups.id, id));
};

const update = async (id: number, data: Partial<IUserGroup>) => {
  await db.update(userGroups).set(data).where(eq(userGroups.id, id));
};

export default {
  getAll,
  getById,
  get,
  create,
  deleteById,
  update,
};

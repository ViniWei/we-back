import { eq } from "drizzle-orm";
import { db } from "../db";
import { movieLists } from "../db/schema";

export interface IMovieList {
  id?: number;
  group_id?: number;
  name?: string;
  created_at?: Date;
}

const getAll = async () => {
  return await db.select().from(movieLists);
};

const getAllByGroupId = async (groupId: number) => {
  return await db
    .select()
    .from(movieLists)
    .where(eq(movieLists.groupId, groupId));
};

const getById = async (id: number) => {
  const result = await db
    .select()
    .from(movieLists)
    .where(eq(movieLists.id, id));
  return result[0];
};

const create = async (data: Partial<IMovieList>) => {
  const result = await db.insert(movieLists).values({
    groupId: data.group_id,
    name: data.name,
    createdAt: data.created_at || new Date(),
  });
  const insertId = Number(result[0].insertId);
  return await getById(insertId);
};

const update = async (id: number, data: Partial<IMovieList>) => {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;

  await db.update(movieLists).set(updateData).where(eq(movieLists.id, id));
};

const deleteById = async (id: number) => {
  await db.delete(movieLists).where(eq(movieLists.id, id));
};

const deleteAllByGroupId = async (groupId: number) => {
  await db.delete(movieLists).where(eq(movieLists.groupId, groupId));
};

// Aliases para compatibilidade
const getByGroupId = getAllByGroupId;

export default {
  getAll,
  getAllByGroupId,
  getByGroupId, // Alias
  getById,
  create,
  update,
  deleteById,
  deleteAllByGroupId,
};

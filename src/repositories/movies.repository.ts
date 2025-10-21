import { eq } from "drizzle-orm";
import { db } from "../db";
import { movies } from "../db/schema";

export interface IMovie {
  id?: number;
  title?: string;
  synopsis?: string;
  api_id?: string;
  poster_path?: string;
  created_at?: Date;
}

const getAll = async () => {
  return await db.select().from(movies);
};

const getById = async (id: number) => {
  const result = await db.select().from(movies).where(eq(movies.id, id));
  return result[0];
};

const getByApiId = async (apiId: string) => {
  const result = await db.select().from(movies).where(eq(movies.apiId, apiId));
  return result[0];
};

const create = async (data: Partial<IMovie>) => {
  const result = await db.insert(movies).values({
    title: data.title,
    synopsis: data.synopsis,
    apiId: data.api_id,
    posterPath: data.poster_path,
    createdAt: data.created_at || new Date(),
  });
  const insertId = Number(result[0].insertId);
  return await getById(insertId);
};

const update = async (id: number, data: Partial<IMovie>) => {
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.synopsis !== undefined) updateData.synopsis = data.synopsis;
  if (data.poster_path !== undefined) updateData.posterPath = data.poster_path;

  await db.update(movies).set(updateData).where(eq(movies.id, id));
};

const deleteById = async (id: number) => {
  await db.delete(movies).where(eq(movies.id, id));
};

export default {
  getAll,
  getById,
  getByApiId,
  create,
  update,
  deleteById,
};

import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { movieListItems } from "../db/schema";

export interface IMovieListItem {
  id?: number;
  movie_id?: number;
  list_id?: number;
  created_at?: Date;
}

const getAll = async () => {
  return await db.select().from(movieListItems);
};

const getAllByListId = async (listId: number) => {
  return await db
    .select()
    .from(movieListItems)
    .where(eq(movieListItems.listId, listId))
    .orderBy(desc(movieListItems.createdAt));
};

const getById = async (id: number) => {
  const result = await db
    .select()
    .from(movieListItems)
    .where(eq(movieListItems.id, id));
  return result[0];
};

const getByMovieAndList = async (movieId: number, listId: number) => {
  const result = await db
    .select()
    .from(movieListItems)
    .where(
      and(
        eq(movieListItems.movieId, movieId),
        eq(movieListItems.listId, listId)
      )
    );
  return result[0];
};

const create = async (data: Partial<IMovieListItem>) => {
  const result = await db.insert(movieListItems).values({
    movieId: data.movie_id,
    listId: data.list_id,
    createdAt: data.created_at || new Date(),
  });
  const insertId = Number(result[0].insertId);
  return await getById(insertId);
};

const deleteById = async (id: number) => {
  await db.delete(movieListItems).where(eq(movieListItems.id, id));
};

const deleteAllByListId = async (listId: number) => {
  await db.delete(movieListItems).where(eq(movieListItems.listId, listId));
};

const deleteAllByMovieId = async (movieId: number) => {
  await db.delete(movieListItems).where(eq(movieListItems.movieId, movieId));
};

// Método adicional para deletar por listId e movieId
const deleteByListAndMovieId = async (listId: number, movieId: number) => {
  await db
    .delete(movieListItems)
    .where(
      and(
        eq(movieListItems.listId, listId),
        eq(movieListItems.movieId, movieId)
      )
    );
};

// Aliases para compatibilidade
const getByListId = getAllByListId;
const deleteByListId = deleteAllByListId;

export default {
  getAll,
  getAllByListId,
  getByListId, // Alias
  getById,
  getByMovieAndList,
  create,
  deleteById,
  deleteAllByListId,
  deleteByListId, // Alias
  deleteAllByMovieId,
  deleteByListAndMovieId,
};

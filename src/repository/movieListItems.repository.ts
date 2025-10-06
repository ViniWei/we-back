import BaseRepository from "./BaseRepository";
import { IMovieListItems } from "../types/database";

const tableName = "movie_list_items";
const baseRepository = new BaseRepository<IMovieListItems>(tableName);

const getAll = async (): Promise<IMovieListItems[]> => {
  return await baseRepository.getAll();
};

const getById = async (id: number): Promise<IMovieListItems | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const getByListId = async (listId: number): Promise<IMovieListItems[]> => {
  return await baseRepository.getAllByField("list_id", listId);
};

const getByMovieId = async (movieId: number): Promise<IMovieListItems[]> => {
  return await baseRepository.getAllByField("movie_id", movieId);
};

const create = async (
  itemData: Omit<IMovieListItems, "id" | "created_at">
): Promise<IMovieListItems> => {
  return await baseRepository.create(itemData);
};

const deleteById = async (id: number): Promise<void> => {
  return await baseRepository.deleteAllByField("id", id);
};

const deleteByListId = async (listId: number): Promise<void> => {
  return await baseRepository.deleteAllByField("list_id", listId);
};

const deleteByListAndMovieId = async (
  listId: number,
  movieId: number
): Promise<void> => {
  const items = await baseRepository.getAllByField("list_id", listId);
  const targetItem = items.find((item) => item.movie_id === movieId);
  if (targetItem && targetItem.id) {
    await baseRepository.deleteAllByField("id", targetItem.id);
  }
};

export default {
  getAll,
  getById,
  getByListId,
  getByMovieId,
  create,
  deleteById,
  deleteByListId,
  deleteByListAndMovieId,
};

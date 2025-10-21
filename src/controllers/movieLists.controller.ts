import { Request, Response } from "express";

import movieListsRepository from "../repositories/movieLists.repository";
import movieListItemsRepository from "../repositories/movieListItems.repository";
import moviesRepository from "../repositories/movies.repository";
import errorHelper from "../helper/error.helper";

export const getAll = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const lists = await movieListsRepository.getAll();
    return res.json(lists);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching movie lists.",
          "error-db-get-movie-lists",
          error
        )
      );
  }
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const list = await movieListsRepository.getById(Number(id));
    if (!list) {
      return res
        .status(404)
        .json(
          errorHelper.buildStandardResponse(
            "Movie list not found.",
            "movie-list-not-found"
          )
        );
    }
    return res.json(list);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching movie list.",
          "error-db-get-movie-list",
          error
        )
      );
  }
};

export const getByGroupId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId: group_id } = (req as any).user;

  if (!group_id) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "User has no group assigned.",
          "no-group-assigned"
        )
      );
  }

  try {
    const lists = await movieListsRepository.getByGroupId(group_id);
    return res.json(lists);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching movie lists.",
          "error-db-get-movie-lists",
          error
        )
      );
  }
};

export const getByGroupIdWithMovies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId: group_id } = (req as any).user;

  if (!group_id) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "User has no group assigned.",
          "no-group-assigned"
        )
      );
  }

  try {
    const lists = await movieListsRepository.getByGroupId(group_id);

    const listsWithMovies = await Promise.all(
      lists.map(async (list) => {
        const listItems = await movieListItemsRepository.getByListId(list.id!);
        const movies = await Promise.all(
          listItems.map(async (item) => {
            const movie = await moviesRepository.getById(item.movieId!);
            return movie ? { ...movie, addedAt: item.createdAt } : undefined;
          })
        );

        return {
          id: list.id!.toString(),
          name: list.name,
          movies: movies
            .filter((movie) => movie !== undefined)
            .map((movie) => ({
              id: movie!.id!.toString(),
              title: movie!.title,
              poster_path: movie!.posterPath,
              synopsis: movie!.synopsis,
              addedAt: movie!.addedAt,
            })),
        };
      })
    );

    return res.json(listsWithMovies);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching movie lists with movies.",
          "error-db-get-movie-lists-with-movies",
          error
        )
      );
  }
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const listData = req.body;
  const { groupId: group_id } = (req as any).user;

  if (!group_id) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "User has no group assigned.",
          "no-group-assigned"
        )
      );
  }

  try {
    const movieList = {
      ...listData,
      group_id,
    };

    const newList = await movieListsRepository.create(movieList);
    return res.status(201).json(newList);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while creating movie list.",
          "error-db-create-movie-list",
          error
        )
      );
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const existingList = await movieListsRepository.getById(Number(id));
    if (!existingList) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Movie list not found.",
            "movie-list-not-found"
          )
        );
    }

    await movieListsRepository.update(Number(id), updateData);
    return res.json({ message: "Movie list updated successfully." });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating movie list.",
          "error-db-update-movie-list",
          error
        )
      );
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const existingList = await movieListsRepository.getById(Number(id));
    if (!existingList) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Movie list not found.",
            "movie-list-not-found"
          )
        );
    }

    await movieListItemsRepository.deleteByListId(Number(id));

    await movieListsRepository.deleteById(Number(id));

    return res.json({ message: "Movie list deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while deleting movie list.",
          "error-db-delete-movie-list",
          error
        )
      );
  }
};

export const addMovieToList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { listId } = req.params;
  const itemData = req.body;
  const { userId } = (req as any).user;

  try {
    const existingList = await movieListsRepository.getById(Number(listId));
    if (!existingList) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Movie list not found.",
            "movie-list-not-found"
          )
        );
    }

    const listItem = {
      ...itemData,
      list_id: Number(listId),
      created_by: userId,
    };

    const newItem = await movieListItemsRepository.create(listItem);
    return res.status(201).json(newItem);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while adding movie to list.",
          "error-db-add-movie-to-list",
          error
        )
      );
  }
};

export const removeMovieFromList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { listId, movieId } = req.params;

  try {
    await movieListItemsRepository.deleteByListAndMovieId(
      Number(listId),
      Number(movieId)
    );
    return res.json({ message: "Movie removed from list successfully." });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while removing movie from list.",
          "error-db-remove-movie-from-list",
          error
        )
      );
  }
};

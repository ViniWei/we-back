import { Request, Response } from "express";

import moviesRepository from "../repository/movies.repository";
import errorHelper from "../helper/error.helper";
import { ICreateMovieRequest } from "../types/api";

export const getAll = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const movies = await moviesRepository.getAll();
    return res.json(movies);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching movies.",
          "error-db-get-movies",
          error
        )
      );
  }
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const movie = await moviesRepository.getById(Number(id));
    if (!movie) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Movie not found.",
            "movie-not-found"
          )
        );
    }
    return res.json(movie);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching movie.",
          "error-db-get-movie",
          error
        )
      );
  }
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const movieData: ICreateMovieRequest = req.body;

  try {
    const newMovie = await moviesRepository.create(movieData);
    return res.status(201).json(newMovie);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while creating movie.",
          "error-db-create-movie",
          error
        )
      );
  }
};

export const createFromApi = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const apiMovieData = req.body;

  try {
    // Check if movie already exists by api_id
    const existingMovie = await moviesRepository.getByApiId(
      apiMovieData.id.toString()
    );

    if (existingMovie) {
      return res.json(existingMovie);
    }

    // Create new movie from API data
    const movieData = {
      title: apiMovieData.title || apiMovieData.original_title,
      synopsis: apiMovieData.overview,
      api_id: apiMovieData.id.toString(),
      poster_path: apiMovieData.poster_path,
    };

    const newMovie = await moviesRepository.create(movieData);
    return res.status(201).json(newMovie);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while creating movie from API.",
          "error-db-create-movie-from-api",
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
    const existingMovie = await moviesRepository.getById(Number(id));
    if (!existingMovie) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Movie not found.",
            "movie-not-found"
          )
        );
    }

    await moviesRepository.update(Number(id), updateData);
    return res.json({ message: "Movie updated successfully." });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating movie.",
          "error-db-update-movie",
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
    const existingMovie = await moviesRepository.getById(Number(id));
    if (!existingMovie) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Movie not found.",
            "movie-not-found"
          )
        );
    }

    await moviesRepository.deleteById(Number(id));
    return res.json({ message: "Movie deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while deleting movie.",
          "error-db-delete-movie",
          error
        )
      );
  }
};

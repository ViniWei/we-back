import moviesRepository from "../repository/movies.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function getAll(_req, res) {
    try {
        const movies = await moviesRepository.getAll();
        res.json(movies);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching movies.", "error-db-get-movies", error));
    }
}

export async function get(req, res) {
    const { id } = req.params;

    let movie;
    try {
        movie = await moviesRepository.getById(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching movie.", "error-db-get-movie", error));
    }

    if (!movie) {
        return res.status(404).send(errorHelper.buildStandardResponse("Movie not found.", "movie-not-found"));
    }

    res.json(movie);
}

export async function getOrCreateIfNotExists(req, res) {
    const { id } = req.body;

    let movie;
    try {
        movie = await moviesRepository.getByApiId(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching movie.", "error-db-get-movie", error));
    }

    if (!movie) {
        const newMovie = {
            title: req.body.title,
            synopsis: req.body.overview,
            poster_path: req.body.poster_path,
            api_id: req.body.id,
            created_at: new Date()
        };

        movie = await moviesRepository.create(newMovie);
    }

    res.json(movie);
}

export async function create(req, res) {
    if (!req.body.title || !req.body.synopsis || !req.body.poster_path || !req.body.api_id) {
        return res.status(400).json(errorHelper.buildStandardResponse("Missing required fields: title, synopsis, poster_path and api_id.", "missing-fields"));
    }

    const movie = {
        title: req.body.title,
        synopsis: req.body.synopsis,
        poster_path: req.body.poster_path,
        api_id: req.body.api_id,
        created_at: new Date()
    };

    try {
        const result = await moviesRepository.create(movie);

        res.json(result);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating movie.", "error-db-create-movie", error));
    }
}

export async function getListsWithMoviesByCouple(req, res) {
    const { couple_id } = req.session.user;

    try {
        const result = await moviesRepository.getListsWithMoviesByCouple(couple_id);

        res.json(result);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching all lists and movies by couple.", "error-db-get-lists-and-movies-couple", error));
    }
}

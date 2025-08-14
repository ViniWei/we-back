import moviesRepository from "../repository/movies.repository.js";
import errorHelper from "../helper/error.helper.js";

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

    return res.json(movie);
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
        await moviesRepository.create(movie);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating movie.", "error-db-create-movie", error));
    }

    return res.json({ message: "New movie created." });
}

export async function createMovieList(req, res) {
    if (!req.body.name || !req.body.couple_id) {
        return res.status(400).json(errorHelper.buildStandardResponse("Missing required fields: name and couple_id.", "missing-fields"));
    }

    const list = {
        name: req.body.name,
        couple_id: req.body.couple_id,
        created_at: new Date()
    };
    try {
        await moviesRepository.createMovieList(list);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating movie list.", "error-db-create-movie-list", error));
    }
    return res.json({ message: "New movie list created." });
}

export async function addMovieToList(req, res) {
    const { listId, movieId } = req.body;
    try {
        await moviesRepository.addMovieToList(listId, movieId);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while adding movie to list.", "error-db-add-movie-to-list", error));
    }

    return res.json({ message: "Movie added to list." });
}

export async function getListsByCouple(req, res) {
    const { coupleId } = req.body;
    try {
        const movies = await moviesRepository.getListsByCouple(coupleId)
        return res.json(movies);
    } catch (error) {
        return res.status(404).send(errorHelper.buildStandardResponse("Error while fetching couple movie lists.", "error-db-get-couple-movie-lists", error));
    }
}

export async function getMoviesByListId(req, res) {
    const { listId } = req.params;
    let movies;

    try {
        movies = await moviesRepository.getMoviesByListId(listId);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching movies by list ID.", "error-db-get-movies-by-list-id", error));
    }

    if (!movies || movies.length === 0) {
        return res.status(404).send(errorHelper.buildStandardResponse("No movies found for this list.", "no-movies-found"));
    }

    return res.json(movies);
}

export async function removeFromList(req, res) {
    const { listId, movieId } = req.params;

    try {
        await moviesRepository.removeFromList(listId, movieId);
    } catch (error) {
        return res.send(errorHelper.buildStandardResponse("Error while removing movie.", "error-db-remove-movie-from-list", error)); 
    }

    return res.json({ message: "Movie removed from list." });
}

export async function removeList(req, res) {
    const { id } = req.params;

    try {
        await moviesRepository.removeList(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while removing movie list.", "error-db-remove-movie-list", error));
    }
    return res.json({ message: "Movie list removed." });
}
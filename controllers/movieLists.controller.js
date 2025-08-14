import movieListsRepository from "../repository/movieLists.repository.js";
import errorHelper from "../helper/error.helper.js";

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
        await movieListsRepository.create(list);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating movie list.", "error-db-create-movie-list", error));
    }
    return res.json({ message: "New movie list created." });
}

export async function getListsByCouple(req, res) {
    const { coupleId } = req.params;
    try {
        const movies = await movieListsRepository.getListsByCouple(coupleId)

        if (movies.length === 0) {
            return res.status(404).send(errorHelper.buildStandardResponse("No movie lists found for this couple.", "no-movie-lists-found"));
        }

        return res.json(movies);
    } catch (error) {
        return res.status(404).send(errorHelper.buildStandardResponse("Error while fetching couple movie lists.", "error-db-get-couple-movie-lists", error));
    }
}

export async function addMovieToList(req, res) {
    const { listId, movieId } = req.body;
    try {
        await movieListsRepository.addMovieToList(listId, movieId);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while adding movie to list.", "error-db-add-movie-to-list", error));
    }

    return res.json({ message: "Movie added to list." });
}

export async function getMoviesByListId(req, res) {
    const { listId } = req.params;
    let movies;

    try {
        movies = await movieListsRepository.getMoviesByListId(listId);
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
        await movieListsRepository.removeFromList(listId, movieId);
    } catch (error) {
        return res.send(errorHelper.buildStandardResponse("Error while removing movie.", "error-db-remove-movie-from-list", error)); 
    }

    return res.json({ message: "Movie removed from list." });
}

export async function removeList(req, res) {
    const { id } = req.params;

    try {
        await movieListsRepository.removeList(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while removing movie list.", "error-db-remove-movie-list", error));
    }
    return res.json({ message: "Movie list removed." });
}
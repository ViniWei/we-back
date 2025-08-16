import movieListsRepository from "../repository/movieLists.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function get(req, res) {
    const { id } = req.params;

    try {
        const list = await movieListsRepository.getById(id);
        if (!list) {
            return res.status(404).json(errorHelper.buildStandardResponse("Movie list not found.", "movie-list-not-found"));
        }
        return res.json(list);
    } catch (error) {
        return res.status(500).json(errorHelper.buildStandardResponse("Error while fetching movie list.", "error-db-get-movie-list", error));
    }
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

export async function deleteList(req, res) {
    const { id } = req.params;

    try {
        await movieListsRepository.deleteList(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while removing movie list.", "error-db-remove-movie-list", error));
    }
    return res.json({ message: "Movie list deleted." });
}
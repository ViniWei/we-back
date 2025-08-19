import movieListsRepository from "../repository/movieLists.repository.js";
import movieListItemsRepository from "../repository/movieListItems.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function getAll(_req, res) {
    try {
        const lists = await movieListsRepository.getAll();
        return res.json(lists);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching movie lists.", "error-db-get-movie-lists", error));
    }
}

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

export async function create(req, res) {
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

export async function update(req, res) {
    const { id } = req.params;
    const payload = req.body;

    if (!payload.name) {
        return res.status(400).json(errorHelper.buildStandardResponse("Missing required fields: name", "missing-fields"));
    }

    try {
        await movieListsRepository.update("id", id, payload);

        return res.json({ message: "Movie list updated successfully." });
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while updating movie list.", "error-db-update-movie-list", error));
    }
}

export async function addToList(req, res) {
    const { list_id, movie_id } = req.body;

    if (!list_id || !movie_id) {
        return res.status(400).json(errorHelper.buildStandardResponse("Missing required fields: list_id and movie_id.", "missing-fields"));
    }

    const item = {
        list_id: list_id,
        movie_id: movie_id,
        created_at: new Date()
    };

    try {
        await movieListItemsRepository.addToList(item);
        return res.json({ message: "Movie added to list." });
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while adding movie to list.", "error-db-add-movie-to-list", error));
    }
};

export async function removeFromList(req, res) {
    const { id } = req.params;

    try {
        await movieListItemsRepository.removeFromList(id);
        return res.json({ message: "Movie removed from list." });
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while removing movie from list.", "error-db-remove-movie-from-list", error));
    }
};


export async function deleteList(req, res) {
    const { id } = req.params;

    try {
        await movieListItemsRepository.deleteAllFromList(id);
        await movieListsRepository.deleteList(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while removing movie list.", "error-db-remove-movie-list", error));
    }
    return res.json({ message: "Movie list deleted." });
}
import couplesRepository from "../repository/couples.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function getAll(_req, res) {
    try {
        const couples = await couplesRepository.getAll();
        res.json(couples);
    } catch (error) {
        res.status(500).send(errorHelper.buildStandardResponse("Error while fetching couples.", "error-db-get-couples", error));
    }
}

export async function get(req, res) {
    const { id } = req.params; 
    
    let couple;
    try {
        couple = await couplesRepository.get(id);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching couple.", "error-db-get-couples", error));
    }

    if (!couple) {
        return res.status(409).send(errorHelper.buildStandardResponse("Couple not found.", "couple-not-found", error));
    }

    res.json(couple);
}

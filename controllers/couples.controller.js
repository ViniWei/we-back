import couplesRepository from "../repository/couples.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function get(req, res) {
    const { id } = req.session.user; 
    
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

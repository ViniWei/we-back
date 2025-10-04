import datesRepository from "../repository/dates.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function create(req, res) {
    console.log(req.session.user);
    const date = { 
        group_id: req.session.user.group_id,
        date: req.body.date,
        description: req.body.description,
        isHappeningEveryYear: req.body.isHappeningEveryYear ? 1 : 0 
    };

    if (!date.date || !date.description) {
        return res.status(400).send(errorHelper.buildStandardResponse("Missing required fields: date, description, isHappeningEveryYear.", "missing-fields"));
    }

    try {
        await datesRepository.create(date);
    } catch (e) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating date.", "error-db-create-date", e));
    }

    res.send("Date stored with success.");
}

export async function getAllByCouple(req, res) {
    const { group_id } = req.session.user;

    let dates;
    try {
        dates = await datesRepository.getAllByUserGroup(group_id);
    } catch (e) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching data from db.", "db-failed-get-dates", e));
    }
    
    res.send(dates);
}

export async function remove(req, res) {
    const id = req.params.id; 
    const group_id = req.session.user.group_id; 
    console.log("couple_id:", group_id);

    let storedDate;
    try {
        storedDate = await datesRepository.getById(id);
    } catch (e) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching data from db.", "db-failed-get-dates", e));
    }

    if (!storedDate) {
        return res.status(404).send(errorHelper.buildStandardResponse("Date not found.", "date-not-found"));
    }

    if (group_id != storedDate.group_id) {
        return res.status(404).send(errorHelper.buildStandardResponse("Invalid date.", "invalid-date"));
    }

    try {
       await datesRepository.remove(id);
    } catch (e) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while deleting data from db.", "db-failed-remove-date", e));
    }

    res.send("Date deleted with success.")
}

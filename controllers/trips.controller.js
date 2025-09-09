import tripsRepository from "../repository/trips.repository.js";
import errorHelper from "../helper/error.helper.js";

function parseTripFromRequest(body) {
    const { city, startDate, endDate, description, status, estimated, icon } = body;
    
    let budget = null;
    if (estimated) {
        budget = parseFloat(estimated.replace("R$", "").replace(/\./g, "").replace(",", "."));
    }

    return {
        city,
        start_date: startDate, 
        end_date: endDate,
        description,
        status,
        estimated_budget: budget,
        icon,
    };
}

export async function getAllTrips(req, res) {
    try {
        const trips = await tripsRepository.getAll();
        res.json(trips);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching trips", "error-db-get-trips", error));
    }
}

export async function getUpcomingTrips(_req, res) {
    try {
        const trips = await tripsRepository.getUpcoming();
        res.json(trips);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching upcoming trips", "error-db-get-upcoming-trips", error));
    }
}

export async function getPastTrips(_req, res) {
    try {
        const trips = await tripsRepository.getPast();
        res.json(trips);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching past trips", "error-db-get-past-trips", error));
    }
}


export async function getTripById(req, res) {
    const { id } = req.params;
    try {
        const trip = await tripsRepository.getById(id);
        if (!trip) {
            return res.status(404).send(errorHelper.buildStandardResponse("Trip not found", "trip-not-found"));
        }
        res.json(trip);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while fetching trip", "error-db-get-trip", error));
    }
}

export async function createTrip(req, res) {
    const { city, startDate, endDate, status } = req.body;
    if (!city || !startDate || !endDate || !status) {
        return res.status(400).send(errorHelper.buildStandardResponse("Missing required fields: city, startDate, endDate, status", "missing-fields"));
    }

    try {
        const newTripData = parseTripFromRequest(req.body);
        const newTrip = await tripsRepository.create(newTripData);
        res.status(201).json(newTrip);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while creating trip", "error-db-create-trip", error));
    }
}

export async function updateTrip(req, res) {
    const { id } = req.params;
    try {
        const tripData = parseTripFromRequest(req.body);
        const updatedTrip = await tripsRepository.update(id, tripData);
         if (!updatedTrip) {
            return res.status(404).send(errorHelper.buildStandardResponse("Trip not found to update", "trip-not-found"));
        }
        res.json(updatedTrip);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while updating trip", "error-db-update-trip", error));
    }
}

export async function deleteTrip(req, res) {
    const { id } = req.params;
    try {
        const result = await tripsRepository.remove(id);
        if (result.affectedRows === 0) {
            return res.status(404).send(errorHelper.buildStandardResponse("Trip not found to delete", "trip-not-found"));
        }
        res.status(204).send();
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while deleting trip", "error-db-delete-trip", error));
    }
}

export async function addPhotosToTrip(req, res) {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).send(errorHelper.buildStandardResponse("No files were uploaded", "no-files-uploaded"));
    }

    try {
        const trip = await tripsRepository.getById(id);
        if (!trip) {
            return res.status(404).send(errorHelper.buildStandardResponse("Trip not found", "trip-not-found"));
        }

        const photoUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
        
        await tripsRepository.addPhotos(id, photoUrls);

        const updatedTrip = await tripsRepository.getById(id);
        res.status(200).json(updatedTrip);
    } catch (error) {
        return res.status(500).send(errorHelper.buildStandardResponse("Error while adding photos", "error-db-add-photos", error));
    }
}

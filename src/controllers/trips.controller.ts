import { Request, Response } from "express";
import tripsRepository from "../repository/trips.repository";
import errorHelper from "../helper/error.helper";
import tripsService from "../services/trips.service";
import {
  ITripCreateRequest,
  ITripUpdateRequest,
  ITrip,
} from "../types/database";

function parseTripFromRequest(
  body: ITripCreateRequest | ITripUpdateRequest
): Partial<ITrip> {
  const { city, startDate, endDate, description, status, estimated, icon } =
    body;

  let budget: number | undefined = undefined;
  if (estimated) {
    budget = parseFloat(
      estimated.replace("R$", "").replace(/\./g, "").replace(",", ".")
    );
  }

  const trip: Partial<ITrip> = {
    city,
    description,
    status,
    icon,
  };

  if (startDate) {
    trip.start_date = new Date(startDate);
  }

  if (endDate) {
    trip.end_date = new Date(endDate);
  }

  if (budget !== undefined) {
    trip.estimated_budget = budget;
  }

  return trip;
}

export async function getAllTrips(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.group_id;
    if (!groupId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "User group not found",
            "user-group-not-found"
          )
        );
    }

    const trips = await tripsRepository.getAll(groupId);
    const formattedTrips = trips.map((trip) =>
      tripsService.formatTripResponse(trip)
    );
    res.json(formattedTrips);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching trips",
          "error-db-get-trips",
          error
        )
      );
  }
}

export async function createTrip(
  req: Request,
  res: Response
): Promise<Response | void> {
  const validation = tripsService.validateTripCreateRequest(req.body);
  if (!validation.isValid) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          `Validation failed: ${validation.errors.join(", ")}`,
          "validation-failed"
        )
      );
  }

  try {
    const groupId = (req as any).user?.group_id;
    if (!groupId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "User group not found",
            "user-group-not-found"
          )
        );
    }

    const newTripData = parseTripFromRequest(req.body);

    if (
      !newTripData.city ||
      !newTripData.start_date ||
      !newTripData.end_date ||
      !newTripData.status
    ) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "Invalid trip data",
            "invalid-trip-data"
          )
        );
    }

    const newTrip = await tripsRepository.create(
      newTripData as Omit<ITrip, "id" | "created_at" | "updated_at">,
      groupId
    );
    const formattedTrip = tripsService.formatTripResponse(newTrip as any);
    res.status(201).json(formattedTrip);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while creating trip",
          "error-db-create-trip",
          error
        )
      );
  }
}

export async function getUpcomingTrips(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.group_id;
    if (!groupId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "User group not found",
            "user-group-not-found"
          )
        );
    }

    const trips = await tripsRepository.getUpcoming(groupId);
    const formattedTrips = trips.map((trip) =>
      tripsService.formatTripResponse(trip)
    );
    res.json(formattedTrips);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching upcoming trips",
          "error-db-get-upcoming-trips",
          error
        )
      );
  }
}

export async function getPastTrips(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.group_id;
    if (!groupId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "User group not found",
            "user-group-not-found"
          )
        );
    }

    const trips = await tripsRepository.getPast(groupId);
    const formattedTrips = trips.map((trip) =>
      tripsService.formatTripResponse(trip)
    );
    res.json(formattedTrips);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching past trips",
          "error-db-get-past-trips",
          error
        )
      );
  }
}

export async function getTripById(
  req: Request,
  res: Response
): Promise<Response | void> {
  const { id } = req.params;
  try {
    const groupId = (req as any).user?.group_id;
    if (!groupId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "User group not found",
            "user-group-not-found"
          )
        );
    }

    const trip = await tripsRepository.getById(id, groupId);
    if (!trip) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse("Trip not found", "trip-not-found")
        );
    }
    const formattedTrip = tripsService.formatTripResponse(trip);
    res.json(formattedTrip);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching trip",
          "error-db-get-trip",
          error
        )
      );
  }
}

export async function updateTrip(
  req: Request,
  res: Response
): Promise<Response | void> {
  const { id } = req.params;

  const validation = tripsService.validateTripUpdateRequest(req.body);
  if (!validation.isValid) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          `Validation failed: ${validation.errors.join(", ")}`,
          "validation-failed"
        )
      );
  }

  try {
    const groupId = (req as any).user?.group_id;
    if (!groupId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "User group not found",
            "user-group-not-found"
          )
        );
    }

    const tripData = parseTripFromRequest(req.body);
    const updatedTrip = await tripsRepository.update(id, tripData, groupId);
    if (!updatedTrip) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Trip not found to update",
            "trip-not-found"
          )
        );
    }
    const formattedTrip = tripsService.formatTripResponse(updatedTrip);
    res.json(formattedTrip);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating trip",
          "error-db-update-trip",
          error
        )
      );
  }
}

export async function deleteTrip(
  req: Request<{ id: string }>,
  res: Response
): Promise<Response | void> {
  const { id } = req.params;
  try {
    const result = await tripsRepository.remove(id);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Trip not found to delete",
            "trip-not-found"
          )
        );
    }
    res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while deleting trip",
          "error-db-delete-trip",
          error
        )
      );
  }
}

export async function addPhotosToTrip(
  req: Request,
  res: Response
): Promise<Response | void> {
  const { id } = req.params;

  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "No files were uploaded",
          "no-files-uploaded"
        )
      );
  }

  try {
    const groupId = (req as any).user?.group_id;
    if (!groupId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "User group not found",
            "user-group-not-found"
          )
        );
    }

    const trip = await tripsRepository.getById(id, groupId);
    if (!trip) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse("Trip not found", "trip-not-found")
        );
    }

    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat();
    const photoUrls = files.map(
      (file: any) =>
        `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    await tripsRepository.addPhotos(id, photoUrls);

    const updatedTrip = await tripsRepository.getById(id, groupId);
    if (updatedTrip) {
      const formattedTrip = tripsService.formatTripResponse(updatedTrip);
      res.status(200).json(formattedTrip);
    } else {
      res.status(200).json({ message: "Photos added successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while adding photos",
          "error-db-add-photos",
          error
        )
      );
  }
}

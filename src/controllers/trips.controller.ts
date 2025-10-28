// src/controllers/trips.controller.ts
import { Request, Response } from "express";
import tripsRepository from "../repositories/trips.repository";
import activitiesRepository from "../repositories/activities.repository";
import errorHelper from "../helper/error.helper";
import tripsService from "../services/trips.service";
import {
  ITripCreateRequest,
  ITripUpdateRequest,
  ITrips,
} from "../types/database";

function parseTripFromRequest(
  body: ITripCreateRequest | ITripUpdateRequest
): Partial<ITrips> {
  const { city, startDate, endDate, description, status, estimated } = body;

  function toLocalDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }

  let budget: number | undefined = undefined;
  if (estimated !== undefined && estimated !== null) {
    if (typeof estimated === "number") {
      budget = estimated;
    } else if (typeof estimated === "string") {
      const clean = estimated
        .replace(/[^\d.,]/g, "")
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}\b)/g, "");
      const num = parseFloat(clean);
      budget = isNaN(num) ? undefined : num;
    }
  }

  const trip: Partial<ITrips> = {
    destination: city,
    description,
    budget,
    start_date: toLocalDate(startDate),
    end_date: toLocalDate(endDate),
  };

  const statusMap: Record<string, number> = {
    Planejando: 1,
    "Em andamento": 2,
    Finalizada: 3,
    Cancelada: 4,
  };

  if (status) {
    trip.status_id = statusMap[status] || 1;
  }

  return trip;
}

export async function getAllTrips(req: Request, res: Response): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const trips = await tripsRepository.getAll(groupId);
    const formattedTrips = trips.map((trip) => tripsService.formatTripResponse(trip));
    res.json(formattedTrips);
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while fetching trips", "error-db-get-trips", error));
  }
}

export async function createTrip(req: Request, res: Response): Promise<Response | void> {
  const validation = tripsService.validateTripCreateRequest(req.body);
  if (!validation.isValid) {
    return res
      .status(400)
      .send(errorHelper.buildStandardResponse(`Validation failed: ${validation.errors.join(", ")}`, "validation-failed"));
  }

  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const newTripData = parseTripFromRequest(req.body);

    if (!newTripData.destination || !newTripData.start_date || !newTripData.end_date || !newTripData.status_id) {
      return res
        .status(400)
        .send(errorHelper.buildStandardResponse("Invalid trip data", "invalid-trip-data"));
    }

    newTripData.group_id = groupId;
    newTripData.created_by = (req as any).user?.id;

    const newTrip = await tripsRepository.create(newTripData);

    try {
      await activitiesRepository.create({
        group_id: groupId,
        trip_id: (newTrip as any).id,
        event_name: `Viagem: ${newTripData.destination}`,
        date: newTripData.start_date,
        location: newTripData.destination,
        description: "Atividade gerada automaticamente ao criar a viagem",
        created_by: (req as any).user?.id,
        created_at: new Date(),
      });
    } catch (activityError) {
      console.error("Erro ao criar atividade automática:", activityError);
    }

    const formattedTrip = tripsService.formatTripResponse(newTrip as any);
    res.status(201).json(formattedTrip);
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while creating trip", "error-db-create-trip", error));
  }
}

export async function getUpcomingTrips(req: Request, res: Response): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const trips = await tripsRepository.getUpcoming(groupId);
    const formattedTrips = trips.map((trip) => tripsService.formatTripResponse(trip));
    res.json(formattedTrips);
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while fetching upcoming trips", "error-db-get-upcoming-trips", error));
  }
}

export async function getPastTrips(req: Request, res: Response): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const trips = await tripsRepository.getPast(groupId);
    const formattedTrips = trips.map((trip) => tripsService.formatTripResponse(trip));
    res.json(formattedTrips);
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while fetching past trips", "error-db-get-past-trips", error));
  }
}

export async function getTripById(req: Request, res: Response): Promise<Response | void> {
  const { id } = req.params;
  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const trip = await tripsRepository.getById(Number(id), groupId);
    if (!trip) {
      return res.status(404).send(
        errorHelper.buildStandardResponse("Trip not found", "trip-not-found")
      );
    }
    const formattedTrip = tripsService.formatTripResponse(trip);
    res.json(formattedTrip);
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while fetching trip", "error-db-get-trip", error));
  }
}

export async function updateTrip(req: Request, res: Response): Promise<Response | void> {
  const { id } = req.params;

  const validation = tripsService.validateTripUpdateRequest(req.body);
  if (!validation.isValid) {
    return res
      .status(400)
      .send(errorHelper.buildStandardResponse(`Validation failed: ${validation.errors.join(", ")}`, "validation-failed"));
  }

  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const tripData = parseTripFromRequest(req.body);
    const updatedTrip = await tripsRepository.update(Number(id), tripData, groupId);

    if (!updatedTrip) {
      return res.status(404).send(
        errorHelper.buildStandardResponse("Trip not found to update", "trip-not-found")
      );
    }

    const formattedTrip = tripsService.formatTripResponse(updatedTrip);
    res.json(formattedTrip);
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while updating trip", "error-db-update-trip", error));
  }
}

export async function deleteTrip(req: Request<{ id: string }>, res: Response): Promise<Response | void> {
  const { id } = req.params;
  try {
    const result = await tripsRepository.remove(Number(id));
    if (!result) {
      return res.status(404).send(
        errorHelper.buildStandardResponse("Trip not found to delete", "trip-not-found")
      );
    }
    res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while deleting trip", "error-db-delete-trip", error));
  }
}

export async function addPhotosToTrip(req: Request, res: Response): Promise<Response | void> {
  const { id } = req.params;

  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res
      .status(400)
      .send(errorHelper.buildStandardResponse("No files were uploaded", "no-files-uploaded"));
  }

  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const trip = await tripsRepository.getById(Number(id), groupId);
    if (!trip) {
      return res.status(404).send(
        errorHelper.buildStandardResponse("Trip not found", "trip-not-found")
      );
    }

    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat();
    const photoUrls = files.map(
      (file: any) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    await tripsRepository.addPhotos(Number(id), photoUrls);

    const updatedTrip = await tripsRepository.getById(Number(id), groupId);
    if (updatedTrip) {
      const formattedTrip = tripsService.formatTripResponse(updatedTrip);
      res.status(200).json(formattedTrip);
    } else {
      res.status(200).json({ message: "Photos added successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while adding photos", "error-db-add-photos", error));
  }
}

export async function deleteTripByCity(req: Request, res: Response): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("User group not found", "user-group-not-found")
      );
    }

    const { city, startDate } = req.body;

    if (!city && !startDate) {
      return res.status(400).send(
        errorHelper.buildStandardResponse("City or startDate required to delete a trip.", "missing-fields")
      );
    }

    let deleted = false;

    if (city && !startDate) {
      deleted = await tripsRepository.deleteByCity(groupId, city);
    } else if (!city && startDate) {
      deleted = await tripsRepository.deleteByDate(groupId, startDate);
    }

    if (!deleted) {
      return res.status(404).send(
        errorHelper.buildStandardResponse(`No trip found for ${city || "the given date"}.`, "trip-not-found")
      );
    }

    return res.status(200).json({
      message: `Trip ${city ? `to ${city}` : ""} has been successfully deleted.`,
    });
  } catch (error) {
    return res
      .status(500)
      .send(errorHelper.buildStandardResponse("Error while deleting trip", "error-db-delete-trip", error));
  }
}

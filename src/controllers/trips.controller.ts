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
  const {
    city,
    startDate,
    endDate,
    description,
    status,
    estimated,
    budget,
    icon,
  } = body;

  let finalBudget: number | undefined = undefined;

  // Priorizar o campo budget se fornecido, senão usar estimated (para backward compatibility)
  if (budget !== undefined) {
    finalBudget = budget;
  } else if (estimated) {
    finalBudget = parseFloat(
      estimated.replace("R$", "").replace(/\./g, "").replace(",", ".")
    );
  }

  const trip: Partial<ITrips> = {
    destination: city,
    description,
    budget: finalBudget,
  };

  if (startDate) {
    // Criar data no formato local sem conversão de timezone
    // Se vier como "2025-11-26", criar como "2025-11-26 00:00:00"
    if (typeof startDate === "string" && startDate.includes("-")) {
      const dateOnly = startDate.split("T")[0]; // "2025-11-26"
      trip.start_date = new Date(`${dateOnly}T00:00:00.000`);
    } else {
      trip.start_date = new Date(startDate);
    }
  }

  if (endDate) {
    // Criar data no formato local sem conversão de timezone
    if (typeof endDate === "string" && endDate.includes("-")) {
      const dateOnly = endDate.split("T")[0]; // "2025-12-12"
      trip.end_date = new Date(`${dateOnly}T00:00:00.000`);
    } else {
      trip.end_date = new Date(endDate);
    }
  }

  // Map status to status_id (pending=1, canceled=2, done=3)
  const statusMap: Record<string, number> = {
    pending: 1,
    canceled: 2,
    done: 3,
  };

  if (status) {
    trip.status_id = statusMap[status] || 1;
  }

  return trip;
}

export async function getAllTrips(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
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
    const groupId = (req as any).user?.groupId;
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
      !newTripData.destination ||
      !newTripData.start_date ||
      !newTripData.end_date ||
      !newTripData.status_id
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

    // Adicionar groupId e created_by
    newTripData.group_id = groupId;
    newTripData.created_by = (req as any).user?.id;

    const newTrip = await tripsRepository.create(newTripData);

    // Criar o registro em activities apontando para a trip, com event_name = destination
    await activitiesRepository.create({
      group_id: groupId,
      trip_id: newTrip.id,
      date_id: undefined,
      event_name: newTripData.destination || "", // Nome do destino da viagem
      date: newTripData.start_date!, // Usa a data de início da trip
      created_by: (req as any).user?.id,
    });

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
    const groupId = (req as any).user?.groupId;
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
    const groupId = (req as any).user?.groupId;
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

export async function getCanceledTrips(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
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

    const trips = await tripsRepository.getCanceled(groupId);
    const formattedTrips = trips.map((trip) =>
      tripsService.formatTripResponse(trip)
    );
    res.json(formattedTrips);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching canceled trips",
          "error-db-get-canceled-trips",
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
    const groupId = (req as any).user?.groupId;
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

    const trip = await tripsRepository.getById(Number(id), groupId);
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
    const groupId = (req as any).user?.groupId;
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
    const updatedTrip = await tripsRepository.update(
      Number(id),
      tripData,
      groupId
    );
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

    // Atualizar o activity correspondente
    const activities = await activitiesRepository.getAllByTripId(Number(id));
    if (activities.length > 0 && tripData.destination) {
      const activity = activities[0];
      await activitiesRepository.update(activity.id!, {
        event_name: tripData.destination, // Atualizar com o novo destino
        date: tripData.start_date,
        modified_by: (req as any).user?.id,
      });
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
    // Deletar todas as atividades vinculadas a essa viagem
    await activitiesRepository.deleteAllByTripId(Number(id));

    // Deletar a viagem
    const result = await tripsRepository.remove(Number(id));
    if (!result) {
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
    const groupId = (req as any).user?.groupId;
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

    const trip = await tripsRepository.getById(Number(id), groupId);
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
      .send(
        errorHelper.buildStandardResponse(
          "Error while adding photos",
          "error-db-add-photos",
          error
        )
      );
  }
}

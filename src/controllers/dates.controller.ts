import { Request, Response } from "express";
import datesRepository from "../repositories/dates.repository";
import activitiesRepository from "../repositories/activities.repository";

export async function getAllDates(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
    if (!groupId) {
      return res.status(400).json({ error: "User group not found" });
    }

    const dates = await datesRepository.getAllByGroupId(groupId);
    res.json(dates);
  } catch (error) {
    return res.status(500).json({ error: "Error while fetching dates" });
  }
}

export async function createDate(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const groupId = (req as any).user?.groupId;
    const userId = (req as any).user?.id;

    if (!groupId || !userId) {
      return res.status(400).json({ error: "User group or ID not found" });
    }

    const { date, location, description, statusId } = req.body;

    if (!date || !statusId) {
      return res.status(400).json({ error: "Date and statusId are required" });
    }

    let dateValue: Date;
    if (typeof date === "string") {
      dateValue = new Date(date.replace(" ", "T") + ".000");
    } else {
      dateValue = new Date(date);
    }

    const newDate = await datesRepository.create({
      group_id: groupId,
      date: dateValue,
      location,
      description,
      status_id: statusId,
      created_by: userId,
    });

    await activitiesRepository.create({
      group_id: groupId,
      date_id: newDate.id,
      trip_id: undefined,
      event_name: location,
      date: dateValue,
      created_by: userId,
    });

    res.status(201).json(newDate);
  } catch (error) {
    return res.status(500).json({ error: "Error while creating date" });
  }
}

export async function updateDate(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { date, location, description, statusId } = req.body;

    const existingDate = await datesRepository.getById(Number(id));
    if (!existingDate) {
      return res.status(404).json({ error: "Date not found" });
    }

    let dateValue: Date | undefined = undefined;
    if (date) {
      if (typeof date === "string") {
        dateValue = new Date(date.replace(" ", "T") + ".000");
      } else {
        dateValue = new Date(date);
      }
    }

    await datesRepository.update(Number(id), {
      date: dateValue,
      location,
      description,
      status_id: statusId,
      modified_by: userId,
    });

    const activities = await activitiesRepository.getAllByDateId(Number(id));
    if (activities.length > 0) {
      const activity = activities[0];
      await activitiesRepository.update(activity.id!, {
        event_name: location,
        date: dateValue,
        modified_by: userId,
      });
    }

    const updatedDate = await datesRepository.getById(Number(id));
    res.json(updatedDate);
  } catch (error) {
    return res.status(500).json({ error: "Error while updating date" });
  }
}

export async function deleteDate(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const { id } = req.params;

    const existingDate = await datesRepository.getById(Number(id));
    if (!existingDate) {
      return res.status(404).json({ error: "Date not found" });
    }

    await activitiesRepository.deleteAllByDateId(Number(id));

    await datesRepository.deleteById(Number(id));
    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Error while deleting date" });
  }
}

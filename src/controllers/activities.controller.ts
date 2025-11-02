import { Request, Response } from "express";
import { ActivitiesService } from "../services/activities.service";
import { IActivities } from "../types/database";

export class ActivitiesController {
  private activitiesService: ActivitiesService;

  constructor() {
    this.activitiesService = new ActivitiesService();
  }

  createActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const activityData: Omit<
        IActivities,
        "id" | "created_at" | "modified_at"
      > = req.body;

      if (
        !activityData.group_id ||
        !activityData.event_name ||
        !activityData.date ||
        !activityData.created_by
      ) {
        res.status(400).json({
          error: "group_id, event_name, date and created_by are required.",
          errorCode: "missing-required-fields",
        });
        return;
      }

      const activity = await this.activitiesService.createActivity(
        activityData
      );
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
        details: error.message,
      });
    }
  };

  getActivityById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const activity = await this.activitiesService.getActivityById(Number(id));

      if (!activity) {
        res.status(404).json({
          error: "Activity not found.",
          errorCode: "activity-not-found",
        });
        return;
      }

      res.json(activity);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
      });
    }
  };

  getActivitiesByGroupId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const activities = await this.activitiesService.getActivitiesByGroupId(
        Number(groupId)
      );
      res.json(activities);
    } catch (error: any) {
      console.error("Error fetching activities by group:", error);
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
        details: error.message,
      });
    }
  };

  getActivitiesByTripId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { tripId } = req.params;
      const activities = await this.activitiesService.getActivitiesByTripId(
        Number(tripId)
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
      });
    }
  };

  getActivitiesByDateRange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          error: "startDate and endDate are required.",
          errorCode: "missing-required-fields",
        });
        return;
      }

      const activities = await this.activitiesService.getActivitiesByDateRange(
        Number(groupId),
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
      });
    }
  };

  getUpcomingActivities = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { days = 7 } = req.query;

      const activities = await this.activitiesService.getUpcomingActivities(
        Number(groupId),
        Number(days)
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
      });
    }
  };

  updateActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: Partial<IActivities> = req.body;

      const activity = await this.activitiesService.updateActivity(
        Number(id),
        updateData
      );

      if (!activity) {
        res.status(404).json({
          error: "Activity not found.",
          errorCode: "activity-not-found",
        });
        return;
      }

      res.json(activity);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
      });
    }
  };

  deleteActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.activitiesService.deleteActivity(Number(id));

      if (!success) {
        res.status(404).json({
          error: "Activity not found.",
          errorCode: "activity-not-found",
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: "Internal server error.",
        errorCode: "error-internal-server",
      });
    }
  };
}

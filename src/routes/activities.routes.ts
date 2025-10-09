import { Router } from "express";
import { ActivitiesController } from "../controllers/activities.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();
const activitiesController = new ActivitiesController();

router.use(authMiddleware.verifySession);

router.post("/", activitiesController.createActivity);

router.get("/:id", activitiesController.getActivityById);

router.get("/group/:groupId", activitiesController.getActivitiesByGroupId);

router.get("/trip/:tripId", activitiesController.getActivitiesByTripId);

router.get(
  "/group/:groupId/range",
  activitiesController.getActivitiesByDateRange
);

router.get(
  "/group/:groupId/upcoming",
  activitiesController.getUpcomingActivities
);

router.put("/:id", activitiesController.updateActivity);

router.delete("/:id", activitiesController.deleteActivity);

export default router;

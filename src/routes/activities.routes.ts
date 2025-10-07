import { Router } from "express";
import { ActivitiesController } from "../controllers/activities.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();
const activitiesController = new ActivitiesController();

// Aplicar middleware de autenticação para todas as rotas
router.use(authMiddleware.verifySession);

// POST /activities - Criar nova atividade
router.post("/", activitiesController.createActivity);

// GET /activities/:id - Buscar atividade por ID
router.get("/:id", activitiesController.getActivityById);

// GET /activities/group/:groupId - Buscar atividades por grupo
router.get("/group/:groupId", activitiesController.getActivitiesByGroupId);

// GET /activities/trip/:tripId - Buscar atividades por viagem
router.get("/trip/:tripId", activitiesController.getActivitiesByTripId);

// GET /activities/group/:groupId/range - Buscar atividades por período
router.get(
  "/group/:groupId/range",
  activitiesController.getActivitiesByDateRange
);

// GET /activities/group/:groupId/upcoming - Buscar próximas atividades
router.get(
  "/group/:groupId/upcoming",
  activitiesController.getUpcomingActivities
);

// PUT /activities/:id - Atualizar atividade
router.put("/:id", activitiesController.updateActivity);

// DELETE /activities/:id - Deletar atividade
router.delete("/:id", activitiesController.deleteActivity);

export default router;

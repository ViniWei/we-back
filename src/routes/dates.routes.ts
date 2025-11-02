import { Router } from "express";
import * as datesController from "../controllers/dates.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware.verifyToken);

// GET /dates - Get all dates for user's group
router.get("/", datesController.getAllDates);

// POST /dates - Create a new date
router.post("/", datesController.createDate);

// PUT /dates/:id - Update a date
router.put("/:id", datesController.updateDate);

// DELETE /dates/:id - Delete a date
router.delete("/:id", datesController.deleteDate);

export default router;

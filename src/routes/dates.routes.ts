import { Router } from "express";
import * as datesController from "../controllers/dates.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware.verifyToken);

router.get("/", datesController.getAllDates);

router.post("/", datesController.createDate);

router.put("/:id", datesController.updateDate);

router.delete("/:id", datesController.deleteDate);

export default router;

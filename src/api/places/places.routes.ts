import express from "express";
import { getNearbyPlacesController } from "./places.controller.js";

const router = express.Router();

// Rota base: /places
router.get("/", getNearbyPlacesController);

export default router;

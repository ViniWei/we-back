import { Router } from "express";
import igdbController from "./igdb.controller";

const router = Router();

router.get("/search", (req, res) => igdbController.search(req, res));
router.get("/:id", (req, res) => igdbController.getById(req, res));

export default router;

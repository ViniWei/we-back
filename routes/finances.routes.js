import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  findFinanceById,
  createFinance,
  getFinancesByGroupId,
  updateFinance,
  deleteFinance,
} from "../controllers/finances.controller.js";

const router = Router();

router.get("/:id", authMiddleware.verifySession, findFinanceById);
router.get("/group/", authMiddleware.verifySession, getFinancesByGroupId);
router.post("/", authMiddleware.verifySession, createFinance);
router.put("/:id", authMiddleware.verifySession, updateFinance);
router.delete("/:id", authMiddleware.verifySession, deleteFinance);

export default router;

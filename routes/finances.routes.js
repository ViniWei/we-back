import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  findFinanceById,
  createFinance,
  getFinancesByCoupleId,
  updateFinance,
  deleteFinance,
} from "../controllers/finances.controller.js";

const router = Router();

router.get("/:id", authMiddleware.verifySession, findFinanceById);
router.get("/couple/", authMiddleware.verifySession, getFinancesByCoupleId);
router.post("/", authMiddleware.verifySession, createFinance);
router.put("/:id", authMiddleware.verifySession, updateFinance);
router.delete("/:id", authMiddleware.verifySession, deleteFinance);

export default router;

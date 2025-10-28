import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  findFinanceById,
  createFinance,
  getFinancesByGroupId,
  updateFinance,
  deleteFinance,
} from "../controllers/finances.controller";

const router = Router();

router.get("/group/", authMiddleware.verifyToken, getFinancesByGroupId);
router.get("/:id", authMiddleware.verifyToken, findFinanceById);
router.post("/", authMiddleware.verifyToken, createFinance);
router.put("/:id", authMiddleware.verifyToken, updateFinance);
router.delete("/:id", authMiddleware.verifyToken, deleteFinance);

export default router;

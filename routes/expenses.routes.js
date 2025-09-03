import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { findExpenseById, createExpense, getExpensesByCoupleId, updateExpense, deleteExpense } from "../controllers/expenses.controller.js";

const router = Router();

router.get("/:id", authMiddleware.verifySession, findExpenseById);
router.get("/couple/:id", authMiddleware.verifySession, getExpensesByCoupleId);
router.post("/", authMiddleware.verifySession, createExpense);
router.put("/:id", authMiddleware.verifySession, updateExpense);
router.delete("/:id", authMiddleware.verifySession, deleteExpense);

export default router;

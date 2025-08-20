import { Router } from "express";
import { findExpenseById, createExpense, getExpensesByCoupleId, updateExpense, deleteExpense } from "../controllers/expenses.controller.js";

const router = Router();

router.get("/:id", findExpenseById);
router.get("/couple/:id", getExpensesByCoupleId);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;

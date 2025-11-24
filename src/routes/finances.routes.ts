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

router.use(authMiddleware.verifyToken);

router.get("/group/", getFinancesByGroupId);
router.get("/:id", findFinanceById);
router.post("/", createFinance);
router.put("/:id", updateFinance);
router.delete("/:id", deleteFinance);

export default router;

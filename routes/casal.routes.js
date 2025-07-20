import { Router } from "express";

import {
    listarTodos,
    obterPorId,
//     criar,
//     atualizar,
//     deletar
} from "../controllers/casal.controller.js";

const router = Router();

router.get("/", listarTodos);
router.get("/:id", obterPorId);
// router.post('/', criar);
// router.put('/:id', atualizar);
// router.delete('/:id', deletar);

export default router;

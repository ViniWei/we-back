import { Router } from "express";

import {
    listar,
    obterPorId,
    criar,
    //     atualizar,
    deletar,
    login
} from "../controllers/usuario.controller.js";

const router = Router();

router.get("/", listar);
router.get("/:id", obterPorId);
router.post("/login", login);
router.post("/", criar);
// router.put('/:id', atualizar);
router.delete("/:id", deletar);

export default router;

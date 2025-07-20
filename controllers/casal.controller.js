import casalRepository from "../repository/casal.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function listarTodos(_req, res) {
    try {
        const casais = await casalRepository.listarTodos();
        res.json(casais);
    } catch {
        res.status(500).send(errorHelper.gerarRetorno("Erro ao obter casais.", "erro-obter-casais"));
    }
}

export async function obterPorId(req, res) {
    const { id } = req.params; 
    
    let casal;
    try {
        casal = await casalRepository.obterPorId(id);
    } catch (error) {
        return res.status(500).send(errorHelper.gerarRetorno("Erro ao obter casal.", "erro-obter-casal", error));
    }

    if (!casal) {
        return res.status(409).send(errorHelper.gerarRetorno("Casal não encontrado.", "casal-não-encontrado", error));
    }

    res.json(casal);
}

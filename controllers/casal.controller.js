import { pool } from '../db.js';
import { genericController } from './generic.controller.js';

const casalFields = ['id', 'relacionamento_ativo', 'data_inicio'];
const casalController = genericController(pool, 'casais', casalFields);

export const listar = casalController.listar;
export const obterPorId = casalController.obterPorId;
export const criar = casalController.criar;
export const atualizar = casalController.atualizar;
export const deletar = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const [usuarios] = await pool.query('SELECT id, nome FROM usuarios WHERE id_casal = ?', [id]);

        if (usuarios.length > 0) {
            return res.status(400).json({
                erro: 'Não é possível deletar um casal com usuários associados.',
                usuariosRelacionados: usuarios
            });
        }

        return casalController.deletar(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao tentar deletar casal' });
    }
};

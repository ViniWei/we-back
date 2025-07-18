import { pool } from '../db.js';
import { genericController } from './generic.controller.js';

const usuarioFields = ['id', 'nome', 'email', 'senha', 'id_casal'];

const usuarioController = genericController(pool, 'usuarios', usuarioFields);

export const listar = usuarioController.listar;
export const obterPorId = usuarioController.obterPorId;
export const atualizar = async (req, res) => {
    delete req.body.data_registro;
    return usuarioController.atualizar(req, res);
};
export const deletar = usuarioController.deletar;

export const criar = async (req, res) => {
    const { nome, email, senha, id_casal } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios!' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ erro: 'E-mail já cadastrado!' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao validar e-mail' });
    }

    const novoUsuario = { nome, email, senha };
    if (id_casal !== undefined && id_casal !== null && id_casal !== '') {
        novoUsuario.id_casal = id_casal;
    }

    req.body = novoUsuario;
    return usuarioController.criar(req, res);
};

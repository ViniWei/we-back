import { pool } from "../db.js";
import RepositorioGenerico from "./RepositorioGenerico.js";

const tableName = "usuarios";
const repositorioGenerico = new RepositorioGenerico(tableName);

const listarTodos = async() => { return await repositorioGenerico.listarTodos(); };
const obterPorId = async(id) => { return await repositorioGenerico.obterPorCampo("id", id); };
const obterPorEmail = async(email) => { return await repositorioGenerico.obterPorCampo("email", email); };
const deletarPorId = async(id) => { return await repositorioGenerico.deletarPorCampo("id", id); };

async function criar(usuario) {
    const query = `INSERT INTO ${tableName} (nome, email, senha, id_casal) VALUES (?, ?, ?, ?)`;
    const values = [usuario.nome, usuario.email, usuario.senha, usuario.idCasal];

    await pool.query(query, values);
}

export default {
    listarTodos,
    obterPorId,
    obterPorEmail,
    criar,
    deletarPorId
};

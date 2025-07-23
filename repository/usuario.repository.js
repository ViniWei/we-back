import { pool } from "../db.js";
import RepositorioGenerico from "./RepositorioGenerico.js";

const tableName = "usuarios";
const repositorioGenerico = new RepositorioGenerico(tableName);

const listarTodos = async() => { return await repositorioGenerico.listarTodos(); };
const obterPorId = async(id) => { return await repositorioGenerico.obterPorCampo("id", id); };
const obterPorEmail = async(email) => { return await repositorioGenerico.obterPorCampo("email", email); };
const deletarPorId = async(id) => { return await repositorioGenerico.deletarPorCampo("id", id); };
const criar = async(usuario) => { return await repositorioGenerico.criar(usuario); };

export default {
    listarTodos,
    obterPorId,
    obterPorEmail,
    criar,
    deletarPorId
};

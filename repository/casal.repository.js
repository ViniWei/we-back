import RepositorioGenerico from "./RepositorioGenerico.js";

const tableName = "casais";
const repositorioGenerico = new RepositorioGenerico(tableName);

const listarTodos = async() => { return await repositorioGenerico.listarTodos(); };
const obterPorId = async(id) => { return await repositorioGenerico.obterPorCampo("id", id); };

export default {
    listarTodos,
    obterPorId
};

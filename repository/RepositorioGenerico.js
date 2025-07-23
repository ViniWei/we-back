import { pool } from "../db.js";

function removerUltimos2Caracteres(texto) {
    return texto.substring(0, texto.length - 2)
}

function formatarDadosParaInsert(camposEValores) {
    const valores = [];
    let nomeCampos = "";
    let interrogacoes = "";

    for (const chave in camposEValores) {
        if (!camposEValores[chave]) continue;

        valores.push(camposEValores[chave]); 
        nomeCampos += chave + ", ";
        interrogacoes += "?, ";
    }

    return {
        nomeCampos: removerUltimos2Caracteres(nomeCampos),
        interrogacoes: removerUltimos2Caracteres(interrogacoes),
        valores
    }
}

export default class RepositorioGenerico {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async listarTodos() {
        const result = await pool.query(`SELECT * FROM ${this.tableName}`);
        return result[0];
    } 
    
    async obterPorCampo(campo, valor) {
        const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE ${campo} = ?`, [valor]);
        return result[0][0];
    } 

    async deletarPorCampo(campo, valor) {
        await pool.query(`DELETE FROM ${this.tableName} WHERE ${campo} = ?`, [valor]);
    } 

    async criar(camposEValores) {
        const { nomeCampos, valores, interrogacoes } = formatarDadosParaInsert(camposEValores);

        const query = `INSERT INTO ${this.tableName} (${nomeCampos}) VALUES (${interrogacoes})`;
        await pool.query(query, valores);
    }
}

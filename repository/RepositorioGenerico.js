import { pool } from "../db.js";

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
}

import { pool } from "../db.js";

function removeLastTwoCharactersFromString(text) {
    return text.substring(0, text.length - 2);
}

function formatDataToInsert(fieldsAndValues) {
    const values = [];
    let fields = "";
    let valueLocation = "";

    for (const key in fieldsAndValues) {
        if (!fieldsAndValues[key]) continue;

        values.push(fieldsAndValues[key]); 
        fields += key + ", ";
        valueLocation += "?, ";
    }

    return {
        fields: removeLastTwoCharactersFromString(fields),
        valueLocation: removeLastTwoCharactersFromString(valueLocation),
        values
    };
}

export default class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async getAll() {
        const result = await pool.query(`SELECT * FROM ${this.tableName}`);
        return result[0];
    } 
    
    async getFirstByField(field, value) {
        const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`, [value]);
        return result[0][0];
    } 

    async deleteAllByField(field, value) {
        await pool.query(`DELETE FROM ${this.tableName} WHERE ${field} = ?`, [value]);
    } 

    /**
     * Receives an object where the key names represent the fields in the database, and their values are assigned to those fields.
     */
    async create(fieldAndValues) {
        const { fields, values, valueLocation } = formatDataToInsert(fieldAndValues);

        const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${valueLocation})`;
        await pool.query(query, values);
    }
}

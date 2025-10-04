import { pool } from "../db.js";

function removeLastTwoCharactersFromString(text) {
    return text.substring(0, text.length - 2);
}

function formatDataToInsert(fieldsAndValues) {
    let fields = "";
    let valueLocation = "";

    for (const key in fieldsAndValues) {
        if (!fieldsAndValues[key]) continue;

        fields += key + ", ";
        valueLocation += "?, ";
    }

    return {
        fields: removeLastTwoCharactersFromString(fields),
        valueLocation: removeLastTwoCharactersFromString(valueLocation),
    };
}

function formatDataToUpdate(fieldsAndValuesToUpdate) {
    let updateFields = "";
    for (const key in fieldsAndValuesToUpdate) {
        if (
            fieldsAndValuesToUpdate[key] === undefined ||
      fieldsAndValuesToUpdate[key] === null
        )
            continue;

        updateFields += `${key} = ?, `;
    }

    return removeLastTwoCharactersFromString(updateFields);
}

export default class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async getAll() {
        const result = await pool.query(`SELECT * FROM ${this.tableName}`);
        return result[0];
    }

    async getAllByField(field, value) {
        const result = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE ${field} = ?`,
            [value]
        );
        return result[0];
    }

    async getFirstByField(field, value) {
        const result = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE ${field} = ?`,
            [value]
        );
        return result[0][0];
    }

    async deleteAllByField(field, value) {
        await pool.query(`DELETE FROM ${this.tableName} WHERE ${field} = ?`, [
            value,
        ]);
    }

    /**
   * Receives an object where the key names represent the fields in the database, and their values are assigned to those fields.
   */
    async create(fieldAndValues) {
        const { fields, valueLocation } = formatDataToInsert(fieldAndValues);

        const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${valueLocation})`;
        const [result] = await pool.query(query, Object.values(fieldAndValues));
        const insertedId = result.insertId;

        const [rows] = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [insertedId]
        );
        return rows[0];
    }

    async updateAllByField(field, value, fieldsAndValuesToUpdate) {
        for (const key in fieldsAndValuesToUpdate) {
            if (
                fieldsAndValuesToUpdate[key] === undefined ||
        fieldsAndValuesToUpdate[key] === null
            ) {
                delete fieldsAndValuesToUpdate[key];
            }
        }

        const data = formatDataToUpdate(fieldsAndValuesToUpdate);

        const query = `UPDATE ${this.tableName} SET ${data} WHERE ${field} = ?`;
        await pool.query(query, [...Object.values(fieldsAndValuesToUpdate), value]);
    }
}

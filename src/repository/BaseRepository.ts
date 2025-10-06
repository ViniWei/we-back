import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { IBaseRepository } from "../types/api.js";

function removeLastTwoCharactersFromString(text: string): string {
  return text.substring(0, text.length - 2);
}

function formatDataToInsert(fieldsAndValues: Record<string, any>): {
  fields: string;
  valueLocation: string;
} {
  let fields = "";
  let valueLocation = "";

  for (const key in fieldsAndValues) {
    if (fieldsAndValues[key] === undefined || fieldsAndValues[key] === null)
      continue;

    fields += key + ", ";
    valueLocation += "?, ";
  }

  return {
    fields: removeLastTwoCharactersFromString(fields),
    valueLocation: removeLastTwoCharactersFromString(valueLocation),
  };
}

function formatDataToUpdate(
  fieldsAndValuesToUpdate: Record<string, any>
): string {
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

export default class BaseRepository<T extends Record<string, any>>
  implements IBaseRepository<T>
{
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${this.tableName}`
    );
    return result as T[];
  }

  async getAllByField(field: string, value: any): Promise<T[]> {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${this.tableName} WHERE ${field} = ?`,
      [value]
    );
    return result as T[];
  }

  async getFirstByField(field: string, value: any): Promise<T | undefined> {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${this.tableName} WHERE ${field} = ?`,
      [value]
    );
    return result[0] as T | undefined;
  }

  async deleteAllByField(field: string, value: any): Promise<void> {
    await pool.query(`DELETE FROM ${this.tableName} WHERE ${field} = ?`, [
      value,
    ]);
  }

  async create(fieldAndValues: Partial<T>): Promise<T> {
    // Adicionar created_at automaticamente se não existir
    const dataWithTimestamp = {
      ...fieldAndValues,
      created_at: fieldAndValues.created_at || new Date(),
    };

    const { fields, valueLocation } = formatDataToInsert(dataWithTimestamp);

    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${valueLocation})`;
    const [result] = await pool.query<ResultSetHeader>(
      query,
      Object.values(dataWithTimestamp).filter(
        (value) => value !== undefined && value !== null
      )
    );
    const insertedId = result.insertId;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [insertedId]
    );
    return rows[0] as T;
  }

  async updateAllByField(
    field: string,
    value: any,
    fieldsAndValuesToUpdate: Partial<T>
  ): Promise<void> {
    const filteredFields: Record<string, any> = {};

    for (const key in fieldsAndValuesToUpdate) {
      if (
        fieldsAndValuesToUpdate[key] !== undefined &&
        fieldsAndValuesToUpdate[key] !== null
      ) {
        filteredFields[key] = fieldsAndValuesToUpdate[key];
      }
    }

    const data = formatDataToUpdate(filteredFields);

    const query = `UPDATE ${this.tableName} SET ${data} WHERE ${field} = ?`;
    await pool.query(query, [...Object.values(filteredFields), value]);
  }
}

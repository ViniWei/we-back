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

  protected formatDateForMySQL(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private formatDatesForMySQL(data: Record<string, any>): Record<string, any> {
    const processed = { ...data };

    Object.keys(processed).forEach((key) => {
      if (processed[key] instanceof Date) {
        processed[key] = this.formatDateForMySQL(processed[key]);
      }
    });

    return processed;
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
    const dataWithTimestamp = { ...fieldAndValues };

    if (this.tableName !== "users" && !dataWithTimestamp.created_at) {
      (dataWithTimestamp as any).created_at = this.formatDateForMySQL(
        new Date()
      );
    }

    const processedData = this.formatDatesForMySQL(dataWithTimestamp);

    const { fields, valueLocation } = formatDataToInsert(processedData);

    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${valueLocation})`;
    const values = Object.values(processedData).filter(
      (value) => value !== undefined && value !== null
    );

    const [result] = await pool.query<ResultSetHeader>(query, values);
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

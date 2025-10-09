import BaseRepository from "./BaseRepository";
import { IActivities } from "../types/database";
import { pool } from "../config/database";
import { RowDataPacket } from "mysql2/promise";

export class ActivitiesRepository extends BaseRepository<IActivities> {
  constructor() {
    super("activities");
  }

  override async create(
    data: Omit<IActivities, "id" | "created_at" | "modified_at">
  ): Promise<IActivities> {
    const processedData = {
      ...data,
      date: this.formatDateForMySQL(new Date(data.date)),
      created_at: this.formatDateForMySQL(new Date()),
    };

    return super.create(processedData as any);
  }

  async findByGroupId(groupId: number): Promise<IActivities[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE group_id = ? 
      ORDER BY date ASC
    `;
    const [result] = await pool.query<RowDataPacket[]>(query, [groupId]);
    return result as IActivities[];
  }

  async findByTripId(tripId: number): Promise<IActivities[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE trip_id = ? 
      ORDER BY date ASC
    `;
    const [result] = await pool.query<RowDataPacket[]>(query, [tripId]);
    return result as IActivities[];
  }

  async findByDateRange(
    groupId: number,
    startDate: Date,
    endDate: Date
  ): Promise<IActivities[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE group_id = ? AND DATE(date) BETWEEN ? AND ?
      ORDER BY date ASC
    `;
    const [result] = await pool.query<RowDataPacket[]>(query, [
      groupId,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ]);
    return result as IActivities[];
  }

  async findUpcoming(
    groupId: number,
    limit: number = 10
  ): Promise<IActivities[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE group_id = ? AND date >= NOW()
      ORDER BY date ASC
      LIMIT ?
    `;
    const [result] = await pool.query<RowDataPacket[]>(query, [groupId, limit]);
    return result as IActivities[];
  }

  async update(
    id: number,
    data: Partial<IActivities>
  ): Promise<IActivities | null> {
    const updateData = {
      ...data,
      modified_at: this.formatDateForMySQL(new Date()),
    };

    if (updateData.date) {
      updateData.date = this.formatDateForMySQL(
        new Date(updateData.date)
      ) as any;
    }

    await this.updateAllByField("id", id, updateData as any);
    const result = await this.getFirstByField("id", id);
    return result ?? null;
  }

  async deleteById(id: number): Promise<void> {
    await this.deleteAllByField("id", id);
  }
}

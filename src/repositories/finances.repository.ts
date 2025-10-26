import { eq } from "drizzle-orm";
import { db } from "../db";
import { finances, users } from "../db/schema";

export interface IFinance {
  id?: number;
  group_id?: number;
  description?: string;
  amount?: number;
  type_id?: number;
  instalments?: number;
  transaction_date?: Date | string;
  created_by?: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
  user_name?: string;
}

// Helper para converter de camelCase (Drizzle) para snake_case (tipos legados)
const toSnakeCase = (data: any): IFinance => ({
  id: data.id,
  group_id: data.groupId,
  description: data.description,
  amount: data.amount,
  type_id: data.typeId,
  instalments: data.instalments,
  transaction_date: data.transactionDate,
  created_by: data.createdBy,
  modified_by: data.modifiedBy,
  created_at: data.createdAt,
  modified_at: data.modifiedAt,
  user_name: data.user_name,
});

const getAll = async (): Promise<IFinance[]> => {
  const result = await db.select().from(finances);
  return result.map(toSnakeCase);
};

const getAllByGroupId = async (groupId: number): Promise<IFinance[]> => {
  const result = await db
    .select({
      id: finances.id,
      groupId: finances.groupId,
      description: finances.description,
      amount: finances.amount,
      typeId: finances.typeId,
      instalments: finances.instalments,
      transactionDate: finances.transactionDate,
      createdBy: finances.createdBy,
      modifiedBy: finances.modifiedBy,
      createdAt: finances.createdAt,
      modifiedAt: finances.modifiedAt,
      user_name: users.name,
    })
    .from(finances)
    .leftJoin(users, eq(finances.createdBy, users.id))
    .where(eq(finances.groupId, groupId));
  return result.map(toSnakeCase);
};

// Alias para compatibilidade
const getByGroupId = getAllByGroupId;

const getById = async (id: number): Promise<IFinance | undefined> => {
  const result = await db.select().from(finances).where(eq(finances.id, id));
  return result[0] ? toSnakeCase(result[0]) : undefined;
};

const create = async (data: Partial<IFinance>): Promise<IFinance> => {
  const now = new Date();

  // Use transaction_date if provided, otherwise use current date
  const transactionDate = data.transaction_date
    ? typeof data.transaction_date === "string"
      ? new Date(data.transaction_date)
      : data.transaction_date
    : now;

  const result = await db.insert(finances).values({
    groupId: data.group_id,
    description: data.description,
    amount: data.amount,
    typeId: data.type_id,
    instalments: data.instalments ?? 1,
    transactionDate: transactionDate,
    createdBy: data.created_by,
    modifiedBy: data.modified_by,
    createdAt: data.created_at || now,
    modifiedAt: data.modified_at || now,
  });
  const insertId = Number(result[0].insertId);
  return (await getById(insertId))!;
};

const update = async (id: number, data: Partial<IFinance>): Promise<void> => {
  const updateData: any = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.type_id !== undefined) updateData.typeId = data.type_id;
  if (data.instalments !== undefined) updateData.instalments = data.instalments;
  if (data.transaction_date !== undefined) {
    updateData.transactionDate =
      typeof data.transaction_date === "string"
        ? new Date(data.transaction_date)
        : data.transaction_date;
  }
  if (data.modified_by !== undefined) updateData.modifiedBy = data.modified_by;
  updateData.modifiedAt = new Date();

  await db.update(finances).set(updateData).where(eq(finances.id, id));
};

const deleteById = async (id: number): Promise<void> => {
  await db.delete(finances).where(eq(finances.id, id));
};

const deleteAllByGroupId = async (groupId: number): Promise<void> => {
  await db.delete(finances).where(eq(finances.groupId, groupId));
};

export default {
  getAll,
  getAllByGroupId,
  getByGroupId, // Alias
  getById,
  create,
  update,
  deleteById,
  deleteAllByGroupId,
};

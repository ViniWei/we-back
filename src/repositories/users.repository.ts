import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { IUser, CreateUser, UpdateUser } from "../types/database";

const getAll = async (): Promise<IUser[]> => {
  const result = await db.select().from(users);
  return result as IUser[];
};

const getById = async (id: number): Promise<IUser | undefined> => {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0] as IUser | undefined;
};

const getByEmail = async (email: string): Promise<IUser | undefined> => {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] as IUser | undefined;
};

const getByGroupId = async (groupId: number): Promise<IUser[]> => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.groupId, groupId));
  return result as IUser[];
};

const deleteAllById = async (id: number): Promise<void> => {
  await db.delete(users).where(eq(users.id, id));
};

const create = async (usuario: CreateUser): Promise<IUser> => {
  const result = await db.insert(users).values(usuario);
  const insertId = Number(result[0].insertId);

  const newUser = await getById(insertId);
  return newUser!;
};

const update = async (
  field: keyof IUser,
  value: any,
  userData: UpdateUser
): Promise<void> => {
  // Mapeamento de campos TypeScript para colunas do banco
  const fieldMap: Record<string, any> = {
    id: users.id,
    email: users.email,
    groupId: users.groupId,
  };

  const dbField = fieldMap[field] || users[field as keyof typeof users];

  if (!dbField) {
    throw new Error(`Field ${String(field)} not found in users table`);
  }

  // Coerce value types for numeric fields to avoid mismatches (e.g. '123' vs 123)
  let whereValue = value;
  if (
    (dbField === users.id || dbField === users.groupId) &&
    typeof value === "string"
  ) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      whereValue = parsed;
    }
  }

  await db.update(users).set(userData).where(eq(dbField, whereValue));
};

export default {
  getAll,
  getById,
  getByEmail,
  getByGroupId,
  create,
  deleteAllById,
  update,
};
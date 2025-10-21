import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { groupInvites } from "../db/schema";

export interface IGroupInvite {
  id?: number;
  code: string;
  creator_user_id?: number;
  creatorUserId?: number;
  status_id?: number;
  statusId?: number;
  expiration?: Date;
  created_at?: Date;
  createdAt?: Date;
}

const getAll = async () => {
  return await db.select().from(groupInvites);
};

const getById = async (id: number) => {
  const result = await db
    .select()
    .from(groupInvites)
    .where(eq(groupInvites.id, id));
  return result[0];
};

const getByCode = async (code: string) => {
  const result = await db
    .select()
    .from(groupInvites)
    .where(eq(groupInvites.code, code));
  return result[0];
};

const getByCreatorId = async (creatorId: number) => {
  const result = await db
    .select()
    .from(groupInvites)
    .where(eq(groupInvites.creatorUserId, creatorId));
  return result[0];
};

// Alias para compatibilidade
const getByCreatorUserId = getByCreatorId;

const create = async (data: Partial<IGroupInvite>) => {
  const result = await db.insert(groupInvites).values({
    code: data.code!,
    creatorUserId: data.creator_user_id || data.creatorUserId,
    statusId: data.status_id || data.statusId,
    expiration: data.expiration,
    createdAt: data.created_at || data.createdAt || new Date(),
  });
  const insertId = Number(result[0].insertId);
  return await getById(insertId);
};

const update = async (id: number, data: Partial<IGroupInvite>) => {
  const updateData: any = {};
  if (data.status_id !== undefined) updateData.statusId = data.status_id;
  if (data.statusId !== undefined) updateData.statusId = data.statusId;
  if (data.expiration !== undefined) updateData.expiration = data.expiration;

  await db.update(groupInvites).set(updateData).where(eq(groupInvites.id, id));
};

const deactivateByCreatorUserId = async (creatorId: number) => {
  await db
    .update(groupInvites)
    .set({ statusId: 3 }) // 3 = expired
    .where(eq(groupInvites.creatorUserId, creatorId));
};

const deleteById = async (id: number) => {
  await db.delete(groupInvites).where(eq(groupInvites.id, id));
};

export default {
  getAll,
  getById,
  getByCode,
  getByCreatorId,
  getByCreatorUserId,
  create,
  update,
  deactivateByCreatorUserId,
  deleteById,
};

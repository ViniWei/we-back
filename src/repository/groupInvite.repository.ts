import BaseRepository from "./BaseRepository";
import {
  IGroupInvite,
  CreateGroupInvite,
  UpdateGroupInvite,
} from "../types/database";

const tableName = "group_invite";
const baseRepository = new BaseRepository<IGroupInvite>(tableName);

const create = async (inviteData: CreateGroupInvite): Promise<IGroupInvite> => {
  return await baseRepository.create(inviteData);
};

const getByCode = async (code: string): Promise<IGroupInvite | undefined> => {
  return await baseRepository.getFirstByField("code", code);
};

const getById = async (id: number): Promise<IGroupInvite | undefined> => {
  return await baseRepository.getFirstByField("id", id);
};

const getByCreatorUserId = async (
  creatorUserId: number
): Promise<IGroupInvite | undefined> => {
  return await baseRepository.getFirstByField("creator_user_id", creatorUserId);
};

const deactivateByCreatorUserId = async (
  creatorUserId: number
): Promise<void> => {
  return await baseRepository.updateAllByField(
    "creator_user_id",
    creatorUserId,
    { status_id: 3 }
  );
};

const update = async (
  id: number,
  fieldsToUpdate: UpdateGroupInvite
): Promise<void> => {
  return await baseRepository.updateAllByField("id", id, fieldsToUpdate);
};

const getAll = async (): Promise<IGroupInvite[]> => {
  return await baseRepository.getAll();
};

export default {
  create,
  getByCode,
  getById,
  getByCreatorUserId,
  deactivateByCreatorUserId,
  update,
  getAll,
};

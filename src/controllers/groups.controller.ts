import { Request, Response } from "express";
import crypto from "crypto";

import groupsRepository from "../repository/groups.repository";
import groupInviteRepository from "../repository/groupInvite.repository";
import usersRepository from "../repository/users.repository";
import errorHelper from "../helper/error.helper";
import { IJoinGroupRequest } from "../types/api";

export const get = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.session.user!;

  try {
    const group = await groupsRepository.get(id);
    if (!group) {
      return res
        .status(409)
        .send(
          errorHelper.buildStandardResponse(
            "Group not found.",
            "group-not-found"
          )
        );
    }
    return res.json(group);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching group.",
          "error-db-get-groups",
          error
        )
      );
  }
};

export const generateInviteCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId } = req.session.user!;

  try {
    console.log("Generating invite code for user:", userId);
    
    // Verificar se o usuário já tem um group_id
    const user = await usersRepository.getById(userId);
    console.log("User:", user);
    
    let groupId = user?.group_id;
    
    // Se o usuário não tem group_id, criar um novo grupo
    if (!groupId) {
      console.log("User doesn't have a group, creating one...");
      
      // Criar um novo grupo
      const newGroup = await groupsRepository.create();
      console.log("Created group:", newGroup);
      
      groupId = newGroup.id!;
      
      // Atualizar o usuário com o group_id
      await usersRepository.update("id", userId, {
        group_id: groupId,
      });
      
      // Atualizar a sessão
      req.session.user!.group_id = groupId;
      console.log("Updated user with group_id:", groupId);
    }
    
    const existingInvite = await groupInviteRepository.getByCreatorUserId(
      userId
    );
    console.log("Existing invite:", existingInvite);

    if (existingInvite && new Date(existingInvite.expiration) > new Date()) {
      return res.json({
        code: existingInvite.code,
        expiration: existingInvite.expiration.toISOString(),
        message: "Active invite code retrieved successfully.",
      });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log("Generated code:", code, "Expiration:", expiration);

    console.log("Deactivating existing invites...");
    await groupInviteRepository.deactivateByCreatorUserId(userId);

    console.log("Creating new invite...");
    await groupInviteRepository.create({
      code,
      creator_user_id: userId,
      status_id: 1,
      expiration,
    });

    return res.json({
      code,
      expiration: expiration.toISOString(),
      message: "Invite code generated successfully.",
    });
  } catch (error) {
    console.error("Error generating invite code:", error);
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while generating invite code.",
          "error-generate-invite",
          error
        )
      );
  }
};

export const joinGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { code }: IJoinGroupRequest = req.body;
  const { id: userId } = req.session.user!;

  if (!code) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Invite code is required.",
          "missing-invite-code"
        )
      );
  }

  try {
    // Verificar se o usuário já tem um grupo através da tabela users
    const user = await usersRepository.getById(userId);
    if (user?.group_id) {
      return res
        .status(409)
        .send(
          errorHelper.buildStandardResponse(
            "User already belongs to a group.",
            "user-already-in-group"
          )
        );
    }

    const invite = await groupInviteRepository.getByCode(code);
    if (!invite) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Invalid invite code.",
            "invalid-invite-code"
          )
        );
    }

    if (new Date(invite.expiration) < new Date()) {
      return res
        .status(410)
        .send(
          errorHelper.buildStandardResponse(
            "Invite code has expired.",
            "expired-invite-code"
          )
        );
    }

    if (invite.status_id !== 1) {
      return res
        .status(410)
        .send(
          errorHelper.buildStandardResponse(
            "Invite code is no longer active.",
            "inactive-invite-code"
          )
        );
    }

    // Buscar o grupo do criador do convite através da tabela users
    const creatorUser = await usersRepository.getById(invite.creator_user_id);
    if (!creatorUser?.group_id) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Creator's group not found.",
            "creator-group-not-found"
          )
        );
    }

    // Atualizar o usuário com o group_id do criador
    await usersRepository.update("id", userId, {
      group_id: creatorUser.group_id,
    });

    req.session.user!.group_id = creatorUser.group_id;

    await groupInviteRepository.update(invite.id!, { status_id: 2 });

    return res.json({
      message: "Successfully joined the group.",
      group_id: creatorUser.group_id,
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while joining group.",
          "error-join-group",
          error
        )
      );
  }
};

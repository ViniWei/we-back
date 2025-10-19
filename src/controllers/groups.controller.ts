import { Request, Response } from "express";
import crypto from "crypto";
import groupsRepository from "../repository/groups.repository";
import groupInviteRepository from "../repository/groupInvite.repository";
import usersRepository from "../repository/users.repository";
import errorHelper from "../helper/error.helper";
import { IJoinGroupRequest } from "../types/api";

export const get = async (req: Request, res: Response): Promise<Response> => {
  const { id } = (req as any).user;

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
  const { id: userId } = (req as any).user;

  try {
    // Verificar se já existe um convite ativo para este usuário
    const existingInvite = await groupInviteRepository.getByCreatorUserId(
      userId
    );

    if (existingInvite && new Date(existingInvite.expiration) > new Date()) {
      return res.json({
        code: existingInvite.code,
        expiration: existingInvite.expiration.toISOString(),
        message: "Active invite code retrieved successfully.",
      });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Desativar convites anteriores deste usuário
    await groupInviteRepository.deactivateByCreatorUserId(userId);

    // Criar novo convite (sem criar grupo ainda)
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
  const { id: userId } = (req as any).user;

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

    // Verificar se o usuário está tentando usar seu próprio código
    if (invite.creator_user_id === userId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "You cannot use your own invite code.",
            "cannot-use-own-code"
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

    // Verificar se o criador do convite já tem grupo
    const creatorUser = await usersRepository.getById(invite.creator_user_id);

    let groupId: number;

    if (creatorUser?.group_id) {
      // Se o criador já tem grupo, usar o grupo existente
      groupId = creatorUser.group_id;
    } else {
      // Se o criador não tem grupo, criar um novo grupo agora
      const newGroup = await groupsRepository.create();
      groupId = newGroup.id!;

      // Associar o criador do convite ao novo grupo
      await usersRepository.update("id", invite.creator_user_id, {
        group_id: groupId,
      });
    }

    // Associar o usuário que está usando o código ao grupo
    await usersRepository.update("id", userId, {
      group_id: groupId,
    });

    // Com JWT não precisamos atualizar a sessão, o token já contém os dados
    // O frontend deve atualizar o perfil após o join

    await groupInviteRepository.update(invite.id!, { status_id: 2 });

    return res.json({
      message: "Successfully joined the group.",
      group_id: groupId,
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

export const getMembers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { group_id } = (req as any).user;

  if (!group_id) {
    return res
      .status(404)
      .send(
        errorHelper.buildStandardResponse(
          "User is not part of any group.",
          "user-not-in-group"
        )
      );
  }

  try {
    const members = await usersRepository.getByGroupId(group_id);

    // Remover informações sensíveis como senhas
    const sanitizedMembers = members.map((member: any) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      emailVerified: member.email_verified,
      groupId: member.group_id,
      createdAt: member.registration_date,
      updatedAt: member.updated_at,
    }));

    return res.json({
      members: sanitizedMembers,
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching group members.",
          "error-db-get-members",
          error
        )
      );
  }
};

export const checkLinkStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId } = (req as any).user;

  try {
    const user = await usersRepository.getById(userId);

    if (user?.group_id) {
      return res.json({
        isLinked: true,
        groupId: user.group_id,
        message: "User is linked to a group",
      });
    } else {
      return res.json({
        isLinked: false,
        groupId: null,
        message: "User is not linked to any group",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while checking link status.",
          "error-check-link-status",
          error
        )
      );
  }
};

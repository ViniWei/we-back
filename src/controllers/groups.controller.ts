import { Request, Response } from "express";
import crypto from "crypto";
import groupsRepository from "../repositories/userGroups.repository";
import groupInviteRepository from "../repositories/groupInvite.repository";
import usersRepository from "../repositories/users.repository";
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
    const existingInvite = await groupInviteRepository.getByCreatorUserId(
      userId
    );

    if (
      existingInvite &&
      existingInvite.expiration &&
      new Date(existingInvite.expiration) > new Date()
    ) {
      return res.json({
        code: existingInvite.code,
        expiration: existingInvite.expiration!.toISOString(),
        message: "Active invite code retrieved successfully.",
      });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await groupInviteRepository.deactivateByCreatorUserId(userId);

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
          "code is required.",
          "missing-required-fields"
        )
      );
  }

  try {
    const user = await usersRepository.getById(userId);
    if (user?.groupId) {
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

    if (invite.creatorUserId === userId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "You cannot use your own invite code.",
            "cannot-use-own-code"
          )
        );
    }

    if (invite.expiration && new Date(invite.expiration) < new Date()) {
      return res
        .status(410)
        .send(
          errorHelper.buildStandardResponse(
            "Invite code has expired.",
            "expired-invite-code"
          )
        );
    }

    if (invite.statusId !== 1) {
      return res
        .status(410)
        .send(
          errorHelper.buildStandardResponse(
            "Invite code is no longer active.",
            "inactive-invite-code"
          )
        );
    }

    const creatorUser = await usersRepository.getById(invite.creatorUserId!);

    let groupId: number;

    if (creatorUser?.groupId) {
      groupId = creatorUser.groupId;
    } else {
      const newGroup = await groupsRepository.create();
      groupId = newGroup.id!;

      await usersRepository.update("id", invite.creatorUserId!, {
        groupId: groupId,
      } as any);
    }

    await usersRepository.update("id", userId, {
      groupId: groupId,
    } as any);
    await groupInviteRepository.update(invite.id!, { status_id: 2 });

    // Buscar dados atualizados do usuário
    const updatedUser = await usersRepository.getById(userId);

    // Gerar novos tokens com o groupId atualizado
    const jwtHelper = (await import("../helper/jwt.helper")).default;
    const { accessToken, refreshToken } = jwtHelper.generateTokens({
      userId: updatedUser!.id!,
      email: updatedUser!.email,
      groupId: updatedUser!.groupId,
    });

    return res.json({
      message: "Successfully joined the group.",
      groupId: groupId,
      accessToken,
      refreshToken,
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
  const { groupId } = (req as any).user;

  if (!groupId) {
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
    const members = await usersRepository.getByGroupId(groupId);

    const sanitizedMembers = members.map((member: any) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      emailVerified: member.emailVerified,
      groupId: member.groupId,
      createdAt: member.registrationDate,
      updatedAt: member.updatedAt,
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
  const { id: userId, groupId: tokenGroupId } = (req as any).user;

  try {
    const user = await usersRepository.getById(userId);

    if (user?.groupId) {
      // Se o usuário tem groupId no banco mas não no token, gerar novos tokens
      let accessToken: string | undefined;
      let refreshToken: string | undefined;

      if (!tokenGroupId || tokenGroupId !== user.groupId) {
        const jwtHelper = (await import("../helper/jwt.helper")).default;
        const tokens = jwtHelper.generateTokens({
          userId: user.id!,
          email: user.email,
          groupId: user.groupId,
        });
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
      }

      return res.json({
        isLinked: true,
        groupId: user.groupId,
        message: "User is linked to a group",
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
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

export const updateGroupImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId } = (req as any).user;
  const { groupImagePath } = req.body;

  if (!groupId) {
    return res
      .status(404)
      .send(
        errorHelper.buildStandardResponse(
          "User is not part of any group.",
          "user-not-in-group"
        )
      );
  }

  if (!groupImagePath) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "groupImagePath is required.",
          "missing-required-fields"
        )
      );
  }

  try {
    await groupsRepository.update(groupId, { groupImagePath });

    return res.json({
      message: "Group image updated successfully.",
      groupImagePath,
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating group image.",
          "error-update-group-image",
          error
        )
      );
  }
};

export const getGroupImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId } = (req as any).user;

  if (!groupId) {
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
    const group = await groupsRepository.getById(groupId);

    if (!group) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Group not found.",
            "group-not-found"
          )
        );
    }

    return res.json({
      groupImagePath: group.groupImagePath || null,
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching group image.",
          "error-get-group-image",
          error
        )
      );
  }
};

export const updateRelationshipStartDate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId } = (req as any).user;
  const { relationshipStartDate } = req.body;

  if (!groupId) {
    return res
      .status(404)
      .send(
        errorHelper.buildStandardResponse(
          "User is not part of any group.",
          "user-not-in-group"
        )
      );
  }

  if (!relationshipStartDate) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "relationshipStartDate is required.",
          "missing-required-fields"
        )
      );
  }

  try {
    // Parse the date and set time to midnight
    const dateObj = new Date(relationshipStartDate);
    dateObj.setHours(0, 0, 0, 0);

    await groupsRepository.update(groupId, {
      relationshipStartDate: dateObj,
    });

    return res.json({
      message: "Relationship start date updated successfully.",
      relationshipStartDate: dateObj.toISOString(),
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating relationship start date.",
          "error-update-relationship-start-date",
          error
        )
      );
  }
};

export const getRelationshipStartDate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId } = (req as any).user;

  if (!groupId) {
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
    const group = await groupsRepository.getById(groupId);

    if (!group) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Group not found.",
            "group-not-found"
          )
        );
    }

    return res.json({
      relationshipStartDate: group.relationshipStartDate || null,
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching relationship start date.",
          "error-get-relationship-start-date",
          error
        )
      );
  }
};

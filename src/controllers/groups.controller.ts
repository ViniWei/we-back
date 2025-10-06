import { Request, Response } from "express";
import crypto from "crypto";

import groupsRepository from "../repository/groups.repository";
import groupInviteRepository from "../repository/groupInvite.repository";
import userGroupsRepository from "../repository/userGroups.repository";
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
    const userHasGroup = await userGroupsRepository.getByUserId(userId);
    if (userHasGroup) {
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

    const creatorGroup = await userGroupsRepository.getByUserId(
      invite.creator_user_id
    );
    if (!creatorGroup) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Creator's group not found.",
            "creator-group-not-found"
          )
        );
    }

    await userGroupsRepository.create({
      user_id: userId,
      group_id: creatorGroup.group_id,
      active: true,
    });

    await usersRepository.update("id", userId, {
      group_id: creatorGroup.group_id,
    });

    req.session.user!.group_id = creatorGroup.group_id;

    await groupInviteRepository.update(invite.id!, { status_id: 2 });

    return res.json({
      message: "Successfully joined the group.",
      group_id: creatorGroup.group_id,
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

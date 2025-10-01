import groupsRepository from "../repository/groups.repository.js";
import groupInviteRepository from "../repository/groupInvite.repository.js";
import userGroupsRepository from "../repository/userGroups.repository.js";
import usersRepository from "../repository/users.repository.js";
import errorHelper from "../helper/error.helper.js";
import crypto from "crypto";

export async function get(req, res) {
  const { id } = req.session.user;

  let group;
  try {
    group = await groupsRepository.get(id);
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

  if (!group) {
    return res
      .status(409)
      .send(
        errorHelper.buildStandardResponse(
          "Group not found.",
          "group-not-found",
          error
        )
      );
  }

  res.json(group);
}

export async function generateInviteCode(req, res) {
  const { id: userId } = req.session.user;

  try {
    const existingInvite = await groupInviteRepository.getByCreatorUserId(
      userId
    );

    if (existingInvite && new Date(existingInvite.expiration) > new Date()) {
      return res.json({
        code: existingInvite.code,
        expiration: existingInvite.expiration,
        message: "Convite ativo encontrado.",
      });
    }

    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);

    const inviteData = {
      code,
      creator_user_id: userId,
      status_id: 1, // Assumindo 1 = ativo
      expiration: expiration.toISOString().slice(0, 19).replace("T", " "),
    };

    const newInvite = await groupInviteRepository.create(inviteData);

    res.json({
      code: newInvite.code,
      expiration: newInvite.expiration,
      message: "Código de convite gerado com sucesso.",
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
}

export async function joinGroup(req, res) {
  const { id: userId } = req.session.user;
  const { code } = req.body;

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
    const invite = await groupInviteRepository.getByCode(code);

    if (!invite) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse(
            "Código de convite inválido.",
            "invalid-invite-code"
          )
        );
    }

    if (new Date(invite.expiration) < new Date()) {
      return res
        .status(410)
        .send(
          errorHelper.buildStandardResponse(
            "Código de convite expirado.",
            "expired-invite-code"
          )
        );
    }

    if (invite.status_id !== 1) {
      return res
        .status(410)
        .send(
          errorHelper.buildStandardResponse(
            "Código de convite não está mais ativo.",
            "inactive-invite-code"
          )
        );
    }

    if (invite.creator_user_id === userId) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "Você não pode usar seu próprio código de convite.",
            "cannot-use-own-invite"
          )
        );
    }

    const groupData = {
      active: true,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    const newUserGroup = await userGroupsRepository.create(groupData);

    await usersRepository.update("id", invite.creator_user_id, {
      group_id: newUserGroup.id,
    });
    await usersRepository.update("id", userId, { group_id: newUserGroup.id });

    await groupInviteRepository.update(invite.id, { status_id: 2 });

    res.json({
      message: "Vínculo criado com sucesso!",
      group_id: newUserGroup.id,
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
}

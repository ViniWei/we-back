import bcrypt from "bcryptjs";
import crypto from "crypto";

import usersRepository from "../repository/users.repository.js";
import mailerService from "../services/mailer.service.js";
import usersService from "../services/users.service.js";
import errorHelper from "../helper/error.helper.js";

export async function get(req, res) {
  const { id } = req.session.user;

  let user;
  try {
    user = await usersRepository.getById(id);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }

  if (!user) {
    return res
      .status(404)
      .send(
        errorHelper.buildStandardResponse("User not found.", "user-not-found")
      );
  }

  res.json(user);
}

export async function create(req, res) {
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: usersService.encryptPassword(req.body.password),
  };

  if (!usersService.verifyEmailFormat(user.email)) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Invalid email format.",
          "email-invalid-format"
        )
      );
  }

  let isUserStored;
  try {
    isUserStored = await usersRepository.getByEmail(user.email);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }

  if (isUserStored) {
    return res
      .status(409)
      .send(
        errorHelper.buildStandardResponse(
          "User already exists.",
          "user-already-exists"
        )
      );
  }

  const { verificationCode, expiresAt } = generateVerificationCode();

  user.verification_code = verificationCode;
  user.verification_expires = expiresAt;

  let newUser;
  try {
    newUser = await usersRepository.create(user);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while creating user.",
          "error-db-create-user",
          error
        )
      );
  }

  const { id, email, name, registration_date } = newUser;

  try {
    await mailerService.sendVerificationEmail(email, verificationCode);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while sending verification code.",
          "error-send-verification-code",
          error
        )
      );
  }

  const payload = {
    id,
    email,
    couple_id: newUser.couple_id,
  };

  req.session.user = payload;

  res.json({
    id,
    email,
    name,
    registration_date,
  });
}

export async function remove(req, res) {
  const { id } = req.session.user;

  let isUserStored;
  try {
    isUserStored = await usersRepository.getById(id);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }

  if (!isUserStored) {
    return res
      .status(409)
      .send(
        errorHelper.buildStandardResponse("User not found.", "user-not-found")
      );
  }

  try {
    await usersRepository.deleteAllById(id);
  } catch (error) {
    return res
      .status(500)
      .json(
        errorHelper.buildStandardResponse(
          "Error while removing user.",
          "error-db-remove-user",
          error
        )
      );
  }

  res.json("User deleted.");
}

export async function update(req, res) {
  const payload = req.body;
  const { id } = req.session.user;

  let isUserStored;
  try {
    isUserStored = await usersRepository.getById(id);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }

  if (!isUserStored) {
    return res
      .status(409)
      .send(
        errorHelper.buildStandardResponse("User not found.", "user-not-found")
      );
  }

  try {
    await usersRepository.update("id", id, payload);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating user.",
          "error-db-user",
          error
        )
      );
  }

  res.json("User updated.");
}

export async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.session.user;

  let user;
  try {
    user = await usersRepository.getById(id);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }
  if (!user) {
    return res
      .status(409)
      .send(
        errorHelper.buildStandardResponse("User not found.", "user-not-found")
      );
  }

  const isSamePassword = await bcrypt.compare(oldPassword, user.senha);
  if (!isSamePassword) {
    return res
      .status(403)
      .send(
        errorHelper.buildStandardResponse(
          "Invalid password.",
          "invalid-password"
        )
      );
  }

  const fieldsToUpdate = {
    senha: usersService.encryptPassword(newPassword),
  };
  try {
    await usersRepository.update("id", id, fieldsToUpdate);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating user.",
          "error-db-user",
          error
        )
      );
  }

  res.json("Changed password.");
}

export async function login(req, res) {
  const { email, password } = req.body;

  let storedUser;
  try {
    storedUser = await usersRepository.getByEmail(email);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }

  if (!storedUser) {
    return res
      .status(404)
      .send(
        errorHelper.buildStandardResponse("User not found.", "user-not-found")
      );
  }

  const isTheSamePassword = await bcrypt.compare(password, storedUser.password);
  if (!isTheSamePassword) {
    return res
      .status(409)
      .send(
        errorHelper.buildStandardResponse(
          "Invalid password.",
          "invalid-password"
        )
      );
  }

  const payload = {
    id: storedUser.id,
    email,
    group_id: storedUser.group_id,
  };

  req.session.user = payload;
  res.json(payload);
}

export async function requestVerificationCode(req, res) {
  const { email } = req.session.user;

  let storedUser;
  try {
    storedUser = await usersRepository.getByEmail(email);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }

  if (!storedUser) {
    return res
      .status(404)
      .send(
        errorHelper.buildStandardResponse("User not found.", "user-not-found")
      );
  }

  const { verificationCode, expiresAt } = generateVerificationCode();

  try {
    const fieldsToUpdate = {
      verification_code: verificationCode,
      verification_expires: expiresAt,
    };

    await usersRepository.update("id", storedUser.id, fieldsToUpdate);
    await mailerService.sendVerificationEmail(email, verificationCode);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while sending verification code.",
          "error-send-verification-code",
          error
        )
      );
  }

  res.json({ message: "Verification code sent." });
}

export async function verifyEmailCode(req, res) {
  const { email, verification_code } = req.body;

  if (!email || !verification_code) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Email and verification code are required.",
          "missing-email-or-code"
        )
      );
  }

  let storedUser;
  try {
    storedUser = await usersRepository.getByEmail(email);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching user.",
          "error-db-get-user",
          error
        )
      );
  }

  if (!storedUser) {
    return res
      .status(404)
      .send(
        errorHelper.buildStandardResponse("User not found.", "user-not-found")
      );
  }

  if (
    storedUser.verification_code !== verification_code ||
    new Date(storedUser.verification_expires) < new Date()
  ) {
    return res
      .status(403)
      .send(
        errorHelper.buildStandardResponse(
          "Invalid verification code.",
          "invalid-verification-code"
        )
      );
  }

  const fieldsToUpdate = {
    email_verified: 1,
  };

  try {
    await usersRepository.update("id", storedUser.id, fieldsToUpdate);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while verifying email.",
          "error-db-verify-email",
          error
        )
      );
  }
  const payload = {
    id: storedUser.id,
    email: storedUser.email,
    group_id: storedUser.group_id,
  };

  req.session.user = payload;

  res.json({ message: "Email verified successfully." });
}

function generateVerificationCode() {
  const verificationCode = crypto
    .randomInt(0, 100000)
    .toString()
    .padStart(5, "0");
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  const data = {
    verificationCode,
    expiresAt,
  };

  return data;
}

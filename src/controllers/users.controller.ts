import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";

import usersRepository from "../repository/users.repository.js";
import mailerService from "../services/mailer.service.js";
import usersService from "../services/users.service.js";
import errorHelper from "../helper/error.helper.js";
import {
  ICreateUserRequest,
  IVerifyEmailRequest,
  IVerificationCodeData,
} from "../types/api.js";
import { IUser } from "../types/database.js";

export const get = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.session.user!;

  try {
    const user = await usersRepository.getById(id);
    if (!user) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse("User not found.", "user-not-found")
        );
    }

    return res.json({
      id: user.id?.toString(),
      name: user.name,
      email: user.email,
      emailVerified: user.email_verified === 1,
      groupId: user.group_id?.toString(),
      createdAt:
        user.registration_date?.toISOString() || new Date().toISOString(),
      updatedAt:
        user.registration_date?.toISOString() || new Date().toISOString(),
    });
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
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, email, password }: ICreateUserRequest = req.body;
  if (!usersService.verifyEmailFormat(email)) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Invalid email format.",
          "email-invalid-format"
        )
      );
  }

  try {
    const isUserStored = await usersRepository.getByEmail(email);
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

    const user: Partial<IUser> = {
      name,
      email,
      password: usersService.encryptPassword(password),
      verification_code: verificationCode,
      verification_expires: expiresAt,
    };

    const newUser = await usersRepository.create(user as IUser);

    try {
      await mailerService.sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    req.session.user = {
      id: newUser.id!,
      email: newUser.email,
      group_id: newUser.group_id,
    };

    return res.json({
      id: newUser.id?.toString(),
      name: newUser.name,
      email: newUser.email,
      emailVerified: newUser.email_verified === 1,
      groupId: newUser.group_id?.toString(),
      createdAt:
        newUser.registration_date?.toISOString() || new Date().toISOString(),
      updatedAt:
        newUser.registration_date?.toISOString() || new Date().toISOString(),
    });
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
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Email and password are required.",
          "missing-email-or-password"
        )
      );
  }

  try {
    const storedUser = await usersRepository.getByEmail(email);
    if (!storedUser) {
      return res
        .status(401)
        .send(
          errorHelper.buildStandardResponse(
            "Invalid credentials.",
            "invalid-credentials"
          )
        );
    }

    const isPasswordValid = await bcrypt.compare(password, storedUser.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send(
          errorHelper.buildStandardResponse(
            "Invalid credentials.",
            "invalid-credentials"
          )
        );
    }

    req.session.user = {
      id: storedUser.id!,
      email: storedUser.email,
      group_id: storedUser.group_id,
    };

    // Gerar um token de sessão simples para React Native
    const sessionToken = `rn_session_${storedUser.id}_${Date.now()}`;
    req.session.token = sessionToken;

    return res.json({
      message: "Login successful.",
      sessionToken, // Token para React Native usar em headers
      user: {
        id: storedUser.id?.toString(),
        name: storedUser.name,
        email: storedUser.email,
        emailVerified: storedUser.email_verified === 1,
        groupId: storedUser.group_id?.toString(),
        createdAt:
          storedUser.registration_date?.toISOString() ||
          new Date().toISOString(),
        updatedAt:
          storedUser.registration_date?.toISOString() ||
          new Date().toISOString(),
      },
    });
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
};

export const verifyEmailCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, verification_code }: IVerifyEmailRequest = req.body;

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

  try {
    const storedUser = await usersRepository.getByEmail(email);
    if (!storedUser) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse("User not found.", "user-not-found")
        );
    }

    if (
      storedUser.verification_code !== verification_code ||
      new Date(storedUser.verification_expires!) < new Date()
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

    await usersRepository.update("id", storedUser.id!, {
      email_verified: 1,
      verification_code: "",
      verification_expires: undefined,
    });

    req.session.user = {
      id: storedUser.id!,
      email: storedUser.email,
      group_id: storedUser.group_id,
    };

    return res.json({ message: "Email verified successfully." });
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
};

function generateVerificationCode(): IVerificationCodeData {
  const verificationCode = crypto
    .randomInt(0, 100000)
    .toString()
    .padStart(5, "0");
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  return {
    verificationCode,
    expiresAt,
  };
}

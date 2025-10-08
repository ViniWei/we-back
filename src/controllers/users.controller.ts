import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";

import usersRepository from "../repository/users.repository";
import mailerService from "../services/mailer.service";
import usersService from "../services/users.service";
import errorHelper from "../helper/error.helper";
import {
  ICreateUserRequest,
  IVerifyEmailRequest,
  IVerificationCodeData,
  IChangePasswordRequest,
} from "../types/api";
import { IUser, CreateUser } from "../types/database";

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

    const user: CreateUser = {
      name,
      email,
      password: usersService.encryptPassword(password),
      verification_code: verificationCode,
      verification_expires: expiresAt,
      email_verified: 0, // Explicitly set to 0 (not verified)
    };

    const newUser = await usersRepository.create(user);

    try {
      await mailerService.sendVerificationEmail(email, verificationCode);
    } catch (emailError) {}

    try {
      req.session.user = {
        id: newUser.id!,
        email: newUser.email,
        group_id: newUser.group_id || undefined,
      };
      console.log("Session set for new user:", req.session.user);
    } catch (sessionError) {}

    const responseData = {
      id: newUser.id?.toString(),
      name: newUser.name,
      email: newUser.email,
      emailVerified: newUser.email_verified === 1,
      groupId: newUser.group_id?.toString() || null,
      createdAt:
        newUser.registration_date?.toISOString() || new Date().toISOString(),
      updatedAt:
        newUser.registration_date?.toISOString() || new Date().toISOString(),
    };

    try {
      return res.status(201).json(responseData);
    } catch (responseError) {
      throw responseError;
    }
  } catch (error) {
    console.error("Error while creating user:", error);
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

    const sessionToken = `rn_session_${storedUser.id}_${Date.now()}`;
    req.session.token = sessionToken;

    return res.json({
      message: "Login successful.",
      sessionToken,
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

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return new Promise((resolve) => {
    if (!req.session || !req.session.user) {
      resolve(res.json({ message: "Logout successful - no active session." }));
      return;
    }

    req.session.destroy((err: any) => {
      if (err) {
        resolve(
          res
            .status(500)
            .send(
              errorHelper.buildStandardResponse(
                "Error while logging out.",
                "error-logout",
                err
              )
            )
        );
      } else {
        resolve(res.json({ message: "Logout successful." }));
      }
    });
  });
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { currentPassword, newPassword }: IChangePasswordRequest = req.body;
  const { id: userId } = req.session.user!;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Current password and new password are required.",
          "missing-passwords"
        )
      );
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "New password must be at least 6 characters long.",
          "password-too-short"
        )
      );
  }

  try {
    const user = await usersRepository.getById(userId);
    if (!user) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse("User not found.", "user-not-found")
        );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "Current password is incorrect.",
            "invalid-current-password"
          )
        );
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "New password must be different from current password.",
            "same-password"
          )
        );
    }

    const hashedNewPassword = usersService.encryptPassword(newPassword);

    await usersRepository.update("id", userId, {
      password: hashedNewPassword,
    });

    return res.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while changing password.",
          "error-change-password",
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

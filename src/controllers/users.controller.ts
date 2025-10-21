import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";

import usersRepository from "../repositories/users.repository";
import mailerService from "../services/mailer.service";
import usersService from "../services/users.service";
import errorHelper from "../helper/error.helper";
import {
  ICreateUserRequest,
  IVerifyEmailRequest,
  IVerificationCodeData,
  IChangePasswordRequest,
  IUpdateUserLanguageRequest,
  IRequestResetPasswordRequest,
  IResetPasswordRequest,
} from "../types/api";
import { CreateUser } from "../types/database";

export const get = async (req: Request, res: Response): Promise<Response> => {
  const { id } = (req as any).user;

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
      emailVerified: user.emailVerified === 1,
      groupId: user.groupId?.toString(),
      createdAt:
        user.registrationDate?.toISOString() || new Date().toISOString(),
      updatedAt:
        user.registrationDate?.toISOString() || new Date().toISOString(),
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

    const user: any = {
      name,
      email,
      password: usersService.encryptPassword(password),
      verificationCode: verificationCode,
      verificationExpires: expiresAt,
      emailVerified: 0,
    };

    const newUser = await usersRepository.create(user);

    try {
      await mailerService.sendVerificationEmail(email, verificationCode);
    } catch (emailError) {}

    const jwtHelper = (await import("../helper/jwt.helper")).default;

    const { accessToken, refreshToken } = jwtHelper.generateTokens({
      userId: newUser.id!,
      email: newUser.email,
      groupId: newUser.groupId,
    });

    const responseData = {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id?.toString(),
        name: newUser.name,
        email: newUser.email,
        emailVerified: newUser.emailVerified === 1,
        groupId: newUser.groupId?.toString() || null,
        createdAt:
          newUser.registrationDate?.toISOString() || new Date().toISOString(),
        updatedAt:
          newUser.registrationDate?.toISOString() || new Date().toISOString(),
      },
    };

    try {
      return res.status(201).json(responseData);
    } catch (responseError) {
      throw responseError;
    }
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

    const jwtHelper = (await import("../helper/jwt.helper")).default;

    const { accessToken, refreshToken } = jwtHelper.generateTokens({
      userId: storedUser.id!,
      email: storedUser.email,
      groupId: storedUser.groupId,
    });

    return res.json({
      message: "Login successful.",
      accessToken,
      refreshToken,
      user: {
        id: storedUser.id?.toString(),
        name: storedUser.name,
        email: storedUser.email,
        emailVerified: storedUser.emailVerified === 1,
        groupId: storedUser.groupId?.toString(),
        createdAt:
          storedUser.registrationDate?.toISOString() ||
          new Date().toISOString(),
        updatedAt:
          storedUser.registrationDate?.toISOString() ||
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
      storedUser.verificationCode !== verification_code ||
      new Date(storedUser.verificationExpires!) < new Date()
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
      emailVerified: 1,
      verificationCode: "",
      verificationExpires: undefined,
    } as any);

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
  return res.json({ message: "Logout successful." });
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { currentPassword, newPassword }: IChangePasswordRequest = req.body;
  const { id: userId } = (req as any).user;

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

export const updateUserLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { language_id }: IUpdateUserLanguageRequest = req.body;
  const { id: userId } = (req as any).user;

  if (!language_id) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Language ID is required.",
          "missing-language-id"
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

    await usersRepository.update("id", userId, {
      languageId: language_id,
    } as any);

    return res.json({
      message: "User language updated successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while updating user language.",
          "error-update-language",
          error
        )
      );
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Refresh token is required.",
          "missing-refresh-token"
        )
      );
  }

  try {
    const jwtHelper = (await import("../helper/jwt.helper")).default;

    const newAccessToken = jwtHelper.refreshAccessToken(refreshToken);

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res
      .status(401)
      .send(
        errorHelper.buildStandardResponse(
          "Invalid or expired refresh token.",
          "invalid-refresh-token",
          error
        )
      );
  }
};

export const requestVerificationCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId } = (req as any).user;

  try {
    const user = await usersRepository.getById(userId);
    if (!user) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse("User not found.", "user-not-found")
        );
    }

    if (user.emailVerified === 1) {
      return res
        .status(400)
        .send(
          errorHelper.buildStandardResponse(
            "Email already verified.",
            "email-already-verified"
          )
        );
    }

    const { verificationCode, expiresAt } = generateVerificationCode();

    await usersRepository.update("id", userId, {
      verificationCode: verificationCode,
      verificationExpires: expiresAt,
    } as any);

    try {
      await mailerService.sendVerificationEmail(user.email, verificationCode);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
    }

    return res.json({
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while requesting verification code.",
          "error-request-verification-code",
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

export const requestResetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email }: IRequestResetPasswordRequest = req.body;

  if (!email) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse("Email is required.", "missing-email")
      );
  }

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
    const user = await usersRepository.getByEmail(email);
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return res.json({
        message: "If the email exists, a reset code has been sent.",
      });
    }

    const { verificationCode, expiresAt } = generateVerificationCode();

    await usersRepository.update("id", user.id!, {
      verificationCode: verificationCode,
      verificationExpires: expiresAt,
    } as any);

    try {
      await mailerService.sendPasswordResetEmail(email, verificationCode);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
    }

    return res.json({
      message: "If the email exists, a reset code has been sent.",
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while requesting password reset.",
          "error-request-reset-password",
          error
        )
      );
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, code, newPassword }: any = req.body;

  if (!email || !code || !newPassword) {
    return res
      .status(400)
      .send(
        errorHelper.buildStandardResponse(
          "Email, code and new password are required.",
          "missing-fields"
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
    const user = await usersRepository.getByEmail(email);
    if (!user) {
      return res
        .status(404)
        .send(
          errorHelper.buildStandardResponse("User not found.", "user-not-found")
        );
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      new Date(user.verificationExpires!) < new Date()
    ) {
      return res
        .status(403)
        .send(
          errorHelper.buildStandardResponse(
            "Invalid or expired reset code.",
            "invalid-reset-code"
          )
        );
    }

    const hashedPassword = usersService.encryptPassword(newPassword);

    await usersRepository.update("id", user.id!, {
      password: hashedPassword,
      verificationCode: "",
      verificationExpires: undefined,
    } as any);

    return res.json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while resetting password.",
          "error-reset-password",
          error
        )
      );
  }
};

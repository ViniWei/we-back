import { Request, Response } from "express";
import { ISessionUser } from "./database";

declare module "express-serve-static-core" {
  interface Request {
    session: {
      user?: ISessionUser;
      [key: string]: any;
    };
  }
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ICreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface IUpdateUserRequest {
  name?: string;
  email?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IVerifyEmailRequest {
  email: string;
  verification_code: string;
}

export interface ICreateMovieRequest {
  api_id: string;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: Date;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
}

export interface IVerificationCodeData {
  verificationCode: string;
  expiresAt: Date;
}

export interface IRequestResetPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface IJoinGroupRequest {
  code: string;
}

export interface IGenerateCodeResponse {
  code: string;
  expiration: string;
  message: string;
}

export interface IJoinGroupResponse {
  message: string;
  group_id: number;
}

export type ControllerFunction = (req: Request, res: Response) => Promise<any>;

export interface IBaseRepository<T> {
  getAll(): Promise<T[]>;
  getAllByField(field: string, value: any): Promise<T[]>;
  getFirstByField(field: string, value: any): Promise<T | undefined>;
  deleteAllByField(field: string, value: any): Promise<void>;
  create(fieldAndValues: Partial<T>): Promise<T>;
  updateAllByField(
    field: string,
    value: any,
    fieldsAndValuesToUpdate: Partial<T>
  ): Promise<void>;
}

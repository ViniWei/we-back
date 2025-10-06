import "express-session";
import { ISessionUser } from "./database";

declare module "express-session" {
  interface SessionData {
    user?: ISessionUser;
  }
}

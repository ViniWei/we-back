import { Request, Response, NextFunction } from "express";
import errorHelper from "../helper/error.helper";

function verifySession(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    res
      .status(400)
      .send(
        errorHelper.buildStandardResponse("Invalid session.", "invalid-session")
      );
    return;
  }

  next();
}

export default {
  verifySession,
};

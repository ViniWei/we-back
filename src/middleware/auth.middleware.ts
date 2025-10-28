import { Request, Response, NextFunction } from "express";
import errorHelper from "../helper/error.helper";
import jwtHelper from "../helper/jwt.helper";

async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Pega o token do header Authorization (formato: "Bearer <token>")
    const authHeader = req.headers["authorization"] as string;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .send(
          errorHelper.buildStandardResponse(
            "Authentication required. Please login.",
            "authentication-required"
          )
        );
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
      const decoded = jwtHelper.verifyAccessToken(token);

      // Armazena os dados do usuário no request para uso nos controllers
      (req as any).user = {
        id: decoded.userId,
        email: decoded.email,
        groupId: decoded.groupId,
      };

      next();
    } catch (jwtError) {
      res
        .status(401)
        .send(
          errorHelper.buildStandardResponse(
            "Invalid or expired token. Please login again.",
            "invalid-token"
          )
        );
    }
  } catch (error) {
    res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Authentication error.",
          "auth-error",
          error
        )
      );
  }
}

export default {
  verifyToken,
};

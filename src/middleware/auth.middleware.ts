import { Request, Response, NextFunction } from "express";
import errorHelper from "../helper/error.helper";

async function verifySession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Primeiro tenta verificar sessão normal (cookies)
    if (req.session?.user) {
      next();
      return;
    }

    // Se não há sessão via cookies, verifica header para React Native
    const sessionToken = req.headers["x-session-token"] as string;

    if (sessionToken) {
      // Busca sessão por token (implementação simples)
      // Extrai user_id do token
      const tokenParts = sessionToken.split("_");

      if (
        tokenParts.length >= 3 &&
        tokenParts[0] === "rn" &&
        tokenParts[1] === "session"
      ) {
        const userId = parseInt(tokenParts[2]);

        if (!isNaN(userId)) {
          // Busca usuário no banco
          const usersRepository = (
            await import("../repository/users.repository")
          ).default;
          const user = await usersRepository.getById(userId);

          if (user) {
            // Cria sessão temporária
            req.session.user = {
              id: user.id!,
              email: user.email,
              group_id: user.group_id,
            };
            next();
            return;
          }
        }
      }
    }

    res
      .status(401)
      .send(
        errorHelper.buildStandardResponse(
          "Authentication required. Please login.",
          "authentication-required"
        )
      );
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
  verifySession,
};

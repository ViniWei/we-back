import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "access-secret-key";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "refresh-secret-key";

// Access token expira em 15 minutos
const ACCESS_TOKEN_EXPIRY = "15m";
// Refresh token expira em 7 dias
const REFRESH_TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  userId: number;
  email: string;
  groupId?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Gera um par de tokens (access e refresh)
 */
export const generateTokens = (payload: JWTPayload): TokenPair => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

/**
 * Verifica e decodifica um access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

/**
 * Verifica e decodifica um refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

/**
 * Gera um novo access token usando um refresh token válido
 */
export const refreshAccessToken = (refreshToken: string): string => {
  const payload = verifyRefreshToken(refreshToken);

  // Gera apenas um novo access token, mantendo o refresh token
  const newAccessToken = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      groupId: payload.groupId,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  return newAccessToken;
};

export default {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
};

import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config/config.js";

export class TokenService {
  constructor(refreshTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
  }
  async generateAccessToken(payload) {
    let privatekey;

    if(!Config.PRIVATE_KEY_SECRET)
    {
      const error = createHttpError(500, "private key is not set!!!");
      throw error;
    }
    
    try {
        privatekey = Config.PRIVATE_KEY_SECRET ;

    } catch {
      const error = createHttpError(500, "error while reading private key");
      throw error;
    }

    const accessToken = jwt.sign(payload, privatekey, {
      algorithm: "RS256",
      expiresIn: "1hr",
      issuer: "auth-service",
    });

    return accessToken;
  }

  async generateRefreshToken(payload) {
    const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(user) {
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      updatedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId) {
    return await this.refreshTokenRepository.delete({
      id: tokenId,
    });
  }
}

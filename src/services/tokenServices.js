import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { fileURLToPath } from "url";
import { Config } from "../config/config.js";

export class TokenService {
  constructor(refreshTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
  }
  async generateAccessToken(payload) {
    let privatekey;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    try {
      // : load and cache private key at process startup instead of per-request I/O
      privatekey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );
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
    const refreshToken = jwt.sign(payload, Config.PRIVATE_KEY_SECRET, {
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
}

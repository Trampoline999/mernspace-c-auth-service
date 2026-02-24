import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { fileURLToPath } from "url";
import { Config } from "../config/config.js";

export class AuthController {
  userService;
  logger;
  constructor({ userService, logger }) {
    this.userService = userService;
    this.logger = logger;
  }
  async register(req, res, next) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      
      let privatekey;
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      try {
        privatekey = fs.readFileSync(
          path.join(__dirname, "../../certs/private.pem"),
        ); 
      } catch (err) {
        const error = createHttpError(500, "error while reading private key");
        next(error);
      }

      const payload = {
        sub: user.id,
        role: user.role,
      };

      const accessToken = jwt.sign(payload, privatekey, {
        algorithm: "RS256",
        expiresIn: "1hr",
        issuer: "auth-service",
      });

      const refreshToken = jwt.sign(payload,Config.PRIVATE_KEY_SECRET, {
        algorithm: "HS256",
        expiresIn: "7d",
        issuer: "auth-service",
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true, // important
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // set ttl to 7 days
      });

      this.logger.info("user created succussfully");
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }
}

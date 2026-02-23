import { validationResult } from "express-validator";
import { sign } from "jsonwebtoken";
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

      const privatekey = "privateKey";
      const payload = {
        sub: user.id,
        role: user.role,
      };

      const accessToken = sign(payload, privatekey, {
        algorithm: "RS256",
        expiresIn: "1hr",
      });

      const refreshToken = sign(payload, privatekey, {
        algorithm: "RS256",
        expiresIn: "7d",
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

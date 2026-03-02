import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class AuthController {
  tokenService;
  userService;
  logger;
  credentialService;

  constructor({ userService, logger, tokenService, credentialService }) {
    this.tokenService = tokenService;
    this.userService = userService;
    this.logger = logger;
    this.credentialService = credentialService;
  }
  // : add login and token refresh handlers alongside register
  async register(req, res, next) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      //saving the user in db
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      const payload = {
        sub: String(user.id),
        role: user.role,
      };

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);
      const accessToken = await this.tokenService.generateAccessToken(payload);
      const refreshToken = await this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      // : make cookie options (domain, secure, sameSite) environment-aware
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

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      //check if email exists in database
      const user = await this.userService.findByEmail({
        email,
      });

      if (!user) {
        const error = createHttpError(400, "email or password does not match");
        next(error);
        return;
      }

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        const error = createHttpError(400, "email or password is invalid");
        next(error);
        return;
      }

      const payload = {
        sub: String(user.id),
        role: user.role,
      };

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);
      const accessToken = await this.tokenService.generateAccessToken(payload);
      const refreshToken = await this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      // : make cookie options (domain, secure, sameSite) environment-aware
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

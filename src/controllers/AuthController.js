import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Roles } from "../constants";

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
        role: Roles.CUSTOMER,
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
        role: user.role || "customer",
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

      this.logger.info("user logged succussfully", { id: user.id });
      res.status(200).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async self(req, res) {
    const user = await this.userService.findById(req.auth.sub);
    res.json(user);
  }

  async refresh(req, res, next) {
    try {
      const payload = {
        sub: req.auth.id,
        role: req.auth.role || "customer",
      };

      const user = await this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const error = createHttpError(
          400,
          "user with token could not be found",
        );
        next(error);
        return;
      }
      // token rotation: generating new token and deleting old token...
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);
      //! deleting...
      await this.tokenService.deleteRefreshToken(req.auth.id);
      this.logger.info("token deleted succussfully");
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

      this.logger.info("user logged succussfully", { id: user.id });
      res.status(200).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async logout(req, res, next) {
    try {
      const tokenId = Number(req.auth.id);
      await this.tokenService.deleteRefreshToken(tokenId);
      this.logger.info("refresh token Deleted successfully");

      console.log("user logged out successfully :", req.auth.sub);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({ message: "user logout successfully" });
    } catch (err) {
      next(err);
      return;
    }
  }
}

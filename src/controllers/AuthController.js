import { validationResult } from "express-validator";

export class AuthController {
  constructor({ userService, logger, TokenService }) {
    this.TokenService = TokenService;
    this.userService = userService;
    this.logger = logger;
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
      const accessToken = await this.TokenService.generateAccessToken(payload);
      const refreshToken = await this.TokenService.generateRefreshToken(
        payload,
        user,
      );

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

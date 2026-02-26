import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/userService.js";
import logger from "../config/logger.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import registerValidators from "../validators/register-validators.js";
import { TokenService } from "../services/tokenServices.js";
import { RefreshToken } from "../entity/RefreshToken.js";

const authRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController({
  userService,
  logger,
  tokenService,
});

authRouter.post("/register", registerValidators, (req, res, next) =>
  authController.register(req, res, next),
);

export default authRouter;

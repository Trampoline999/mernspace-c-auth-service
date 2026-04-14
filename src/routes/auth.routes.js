import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/UserService.js";
import logger from "../config/logger.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import registerValidators from "../validators/register-validators.js";
import loginValidators from "../validators/login-validators.js";
import { TokenService } from "../services/tokenServices.js"
import { RefreshToken } from "../entity/RefreshToken.js";
import { CredentialService } from "../services/credentialService.js";
import { authenticate } from "../middleware/authenticate.js";
import validateRefresh from "../middleware/validateRefresh.js";
import parsedToken from "../middleware/parseToken.js";

const authRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController({
  userService,
  logger,
  tokenService,
  credentialService,
});

authRouter.post("/register", registerValidators, (req, res, next) =>
  authController.register(req, res, next),
);

authRouter.post("/login", loginValidators, (req, res, next) =>
  authController.login(req, res, next),
);

authRouter.get("/self", authenticate, (req, res, next) =>
  authController.self(req, res, next),
);

authRouter.post("/refresh", validateRefresh, (req, res, next) =>
  authController.refresh(req, res, next),
);
authRouter.post("/logout", parsedToken, (req, res, next) =>
  authController.logout(req, res, next),
);

export default authRouter;

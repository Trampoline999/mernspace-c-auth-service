import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/userService.js";
import logger from "../config/logger.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import registerValidators from "../validators/register-validators.js";

const authRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController({ userService, logger });

authRouter.post("/register", registerValidators, (req, res, next) =>
  authController.register(req, res, next),
);

export default authRouter;

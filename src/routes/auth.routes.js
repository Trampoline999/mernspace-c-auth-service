import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/userService.js";
import logger from "../config/logger.js";

const authRouter = express.Router();
const userService = new UserService();
const authController = new AuthController({ userService, logger });

authRouter.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

export default authRouter;

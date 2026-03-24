import express from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { authenticate } from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { Roles } from "../constants";
const userRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.create(req, res, next),
);

export default userRouter;

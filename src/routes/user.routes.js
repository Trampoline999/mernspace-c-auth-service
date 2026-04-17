import express from "express";
import { UserController } from "../controllers/UserController.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import { authenticate } from "../middleware/authenticate.js";
import { canAccess } from "../middleware/canAccess.js";
import { Roles } from "../constants/index.js";
import { UserService } from "../services/userService.js"
import logger from "../config/logger.js";

const userRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService (userRepository);
const userController = new UserController(userService,logger);

userRouter.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.create(req, res, next),
);
userRouter.get("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.getAllUsers(req, res, next),
);
userRouter.get("/:id", authenticate, (req, res, next) =>
  userController.getUser(req, res, next),
);
userRouter.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.update(req, res, next),
);
userRouter.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.delete(req, res, next),
);


export default userRouter;
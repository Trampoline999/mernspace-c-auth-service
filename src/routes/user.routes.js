import express from "express";
import { UserController } from "../controllers/UserController";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { authenticate } from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { Roles } from "../constants";
import { UserService } from "../services/UserService";
const userRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.create(req, res, next),
);
userRouter.get("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.getAllUser(req, res, next),
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
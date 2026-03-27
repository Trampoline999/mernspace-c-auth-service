import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserController {
  userService;
  logger;

  constructor(userService, logger) {
    this.userService = userService;
    this.logger = logger;
  }
  async create(req, res, next) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await this.userService.getAllUsers();
      if (!users) {
        const err = createHttpError(404, "no user found in database");
        next(err);
      }
      res.status(201).json({ users });
    } catch (err) {
      next(err);
      return;
    }
  }
  async getUser(req, res, next) {
    try {
      const id = req.params.id;
      const user = await this.userService.findById(id);
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async update(req, res, next) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const user = await this.userService.findById(id);

      if (!user) {
        const err = createHttpError(401, "invalid token no user found...");
        next(err);
      }
      this.logger.info("user deleted successfully");
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }
}

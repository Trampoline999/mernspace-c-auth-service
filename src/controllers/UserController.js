import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class UserController {
  userService;
  logger;

  constructor(userService, logger) {
    this.userService = userService;
    this.logger = logger;
  }
  async create(req, res, next) {
    try {
      const { firstName, lastName, email, password,tenantId,role } = req.body;
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
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
      const user = await this.userService.findById(Number(id));
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async update(req, res, next) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
      const id = req.params.id;
      const { firstName, lastName, email, role, tenantId } = req.body;

      const updatedUser = await this.userService.updateUser(Number(id), {
        firstName,
        lastName,
        email,
        role,
        tenantId,
      });

      this.logger.info("user updated successfully");
      res.status(201).json({ id: updatedUser.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const user = await this.userService.deleteUser(Number(id));
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
import { validationResult } from "express-validator";
export class AuthController {
  userService;
  logger;
  constructor({ userService, logger }) {
    this.userService = userService;
    this.logger = logger;
  }
  async register(req, res, next) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("user created succussfully");
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }
}

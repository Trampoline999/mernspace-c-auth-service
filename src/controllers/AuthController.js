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

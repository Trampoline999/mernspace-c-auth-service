import { Roles } from "../constants";

export class UserController {
  userService;

  constructor(userService) {
    this.userService = userService;
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
}

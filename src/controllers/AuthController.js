import { userService } from "../services/userService";

export class AuthController {
  userService;
  constructor(userService) {
    this.userService = userService;
  }
  async register(req, res) {
    const { firstName, lastName, email, password } = req.body;

    this.userService.create({ firstName, lastName, email, password });
    res.status(201).json("register registered successfully");
  }
}

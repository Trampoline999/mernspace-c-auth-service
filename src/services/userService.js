import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { Roles } from "../constants/index.js";
export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async create({ firstName, lastName, email, password }) {
    try {

      const saltRounds =10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
      return user;
    } catch (error) {
      const err = createHttpError(500, "failed to store data in the database");
      throw err;
    }
  }
}

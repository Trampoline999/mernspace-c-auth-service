import createHttpError from "http-errors";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";

export class UserService {
  async create({ firstName, lastName, email, password }) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save({ firstName, lastName, email, password });
    } catch {
      const err = createHttpError(500, "failed to store data in the database");
      throw err;
    }
  }
}

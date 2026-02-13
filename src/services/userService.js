import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

export class userService {
  async create({ firstName, lastName, email, password }) {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.save({ firstName, lastName, email, password });
  }
}

import createHttpError from "http-errors";
import bcrypt from "bcrypt";
export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async create({ firstName, lastName, email, password, role }) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
      });

      if (user) {
        const err = createHttpError(400, "email already exists");
        throw err;
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      });
    } catch (err) {
      if (err.status === 400) {
        throw err;
      }
      const error = createHttpError(
        500,
        "failed to store data in the database",
      );
      throw error;
    }
  }

  async findByEmail({ email }) {
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password") // brings back the select:false field
      .where("user.email = :email", { email })
      .getOne();
  }

  async findById(id) {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getAllUsers() {
    return await this.userRepository.find({});
  }
}

import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async create({ firstName, lastName, email, password, role ,tenantId}) {
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
        tenantId: tenantId !== undefined ? tenantId :undefined
      });
      
    } catch (err) {
      if (err.status === 400) {
        throw err;
      }
      const error = createHttpError(
        500,
        "failed to store data in the  database",
      );
      throw error;
    }
  }

  async findByEmail({ email }) {
    return await this.userRepository.findOne({
      where:{
        email
      }
    })
  }

  async findByEmailWithPassword({ email }) {
    return await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password") // brings back the select:false field
      .where("user.email = :email", { email })
      .getOne();
  }

  async findById(id) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getAllUsers() {
    return await this.userRepository.find({});
  }

  async updateUser(id, { firstName, lastName, email, role, tenantId }) {
    try {
      return await this.userRepository.update(id, {
        firstName,
        lastName,
        email,
        role,
        tenant: id ? { id: tenantId } : null,
      });
    } catch {
      const err = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw err;
    }
  }

  async deleteUser(id) {
    try {
      await this.userRepository.delete(id);
      return true;
    } catch {
      const err = createHttpError(
        500,
        "Failed to delete the user from the database",
      );
      throw err;
    }
  } 
}

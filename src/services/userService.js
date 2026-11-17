import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { In } from "typeorm";
import { Brackets } from "typeorm";
export class UserService {

  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async create({ firstName, lastName, email, password, role, tenantId }) {
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
        tenantId: tenantId !== "undefined" ? tenantId : "undefined"
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
      where: {
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
      relations: {
        tenant: true,
      },
    });
  }

  async getAllUsers({ search, role, currentPage, perPage }) {

    //# todo
    const queryBuilder = await this.userRepository.createQueryBuilder('user');

    if (search) {
      const searchTerm = `%${search}%`

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("user.firstName ILIKE :search", { search: searchTerm })
            .orWhere("user.lastName ILIKE :search", { search: searchTerm })
            .orWhere("user.email ILIKE :search", { search: searchTerm });
        })
      );
    }

    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }
    const result = await queryBuilder
      .orderBy("user.id", "DESC")
      .skip((currentPage - 1) * perPage)
      .take(perPage)
      .getManyAndCount()

    return result;
  }

  async updateUser(id, { firstName, lastName, email, role, tenantId }) {
    try {
      await this.userRepository.update(id, {
        firstName,
        lastName,
        email,
        role,
        tenantId: tenantId !== "undefined" ? tenantId : null,
      });

      return await this.userRepository.findOne({ where: { id } });
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

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import { AppDataSource } from "../../config/data-source.js";
import request from "supertest";
import { User } from "../../entity/User.js";
import app from "../../app.js";
import bcrypt from "bcrypt";

describe("/auth/login", () => {
  let connection;
  let userRepository;

  let registerData = {
    firstName: "onkar",
    lastName: "chougule",
    email: "onkarchougule@gmail.com",
    password: "secret@123",
  };
  let userData = {
    email: "onkarchougule@gmail.com",
    password: "secret@123",
  };

  const registerUser = async (registerData) => {
    return await request(app).post("/auth/register").send(registerData);
  };
  const loginUser = async (userData = {}) => {
    return await request(app).post("/auth/login").send(userData);
  };

  beforeAll(async () => {
    try {
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.error("Error during Data Source initialization:", error);
      throw error; // Fail the test immediately if DB doesn't start
    }
  });

  beforeEach(async () => {
    if (connection && connection.isInitialized) {
      await connection.dropDatabase();
     // console.log("Database dropped successfully.");
      await connection.synchronize();
      userRepository = await connection.getRepository(User);
      // await truncateTable(connection);
    }
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return 200 status code", async () => {
    // First create a user in the database
    await registerUser(registerData);
    await userRepository.findOne({
      where: {
        email: userData.email,
      },
      select: ["password"],
    });

    const response = await loginUser(userData);
    expect(response.statusCode).toBe(200);
  });

  it("should check password is correct or not", async () => {
    await registerUser(registerData);
    const user = await userRepository.findOne({
      where: {
        email: userData.email,
      },
      select: ["password"],
    });

    const comparePassword = await bcrypt.compare(
      userData.password,
      user.password,
    );
    expect(comparePassword).toBe(true);
  });
});

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { AppDataSource } from "../../config/data-source.js";
import { User } from "../../entity/User.js";
import { Roles } from "../../constants/index.js";

describe("POST /auth/register", () => {
  let connection;

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
      console.log("Database dropped successfully.");
      await connection.synchronize();
      // await truncateTable(connection);
    }
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  describe("Given all test fields", () => {
    it("should return 200 status code", async () => {
      //Arrange
      const userData = {
        firstName: "onkar",
        lastName: "chougule",
        email: "onkarchougule@gmail.com",
        password: "secret",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //assert
      expect(response.statusCode).toBe(201);
    });

    it("should return json response", async () => {
      const userData = {
        firstName: "onkar",
        lastName: "chougule",
        email: "onkarchougule@gmail.com",
        password: "secret",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      //assert
      expect(response.type).toBe("application/json");
    });

    it("should return user from database", async () => {
      const userData = {
        firstName: "onkar",
        lastName: "chougule",
        email: "onkarchougule@gmail.com",
        password: "secret",
      };
      //Act
      await request(app).post("/auth/register").send(userData);
      //assert
      const userRepository = await connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
    });
  });

  it("should return an id of created user from database", async () => {
    const userData = {
      firstName: "onkar",
      lastName: "chougule",
      email: "onkarchougule@gmail.com",
      password: "secret",
    };
    //Act
    const response = await request(app).post("/auth/register").send(userData);

    //assert
    expect(response.body).toHaveProperty("id");
  });

  it("should assign a custormer role", async () => {
    const userData = {
      firstName: "onkar",
      lastName: "chougule",
      email: "onkarchougule@gmail.com",
      password: "secret",
    };
    //Act
    await request(app).post("/auth/register").send(userData);
    //assert
    const userRepository = await connection.getRepository(User);
    const user = await userRepository.find();
    expect(user[0]).toHaveProperty("role");
    expect(user[0].role).toBe(Roles.CUSTOMER);
  });

  it("should store hashed password in database ", async () => {
    const userData = {
      firstName: "onkar",
      lastName: "chougule",
      email: "onkarchougule@gmail.com",
      password: "secret",
    };
    //Act
    await request(app).post("/auth/register").send(userData);
    //assert
    const userRepository = await connection.getRepository(User);
    const users = await userRepository.find();
    expect(users[0].password).not.toBe(userData.password);
    expect(users[0].password).toHaveLength(60);
  });

  it("should return 400 if email already exists in database ", async () => {
    const userData = {
      firstName: "onkar",
      lastName: "chougule",
      email: "onkarchougule@gmail.com",
      password: "secret",
    };
    const userRepository = await connection.getRepository(User);
    await userRepository.save({ ...userData, role: Roles.CUSTOMER });
    //Act
    const response = await request(app).post("/auth/register").send(userData);

    //assert
    expect(response.statusCode).toBe(400);
  });

  it("should have one user in database ", async () => {
    const userData = {
      firstName: "onkar",
      lastName: "chougule",
      email: "onkarchougule@gmail.com",
      password: "secret",
    };
    const userRepository = await connection.getRepository(User);
    await userRepository.save({ ...userData, role: Roles.CUSTOMER });
    //Act
    const response = await request(app).post("/auth/register").send(userData);
    const users = await userRepository.find({});

    //assert
    expect(users).toHaveLength(1);
  });

  describe("Fields are missing", () => {});
});

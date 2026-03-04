/* import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import { AppDataSource } from "../../config/data-source";
import request from "supertest";
import { User } from "../../entity/User";
import app from "../../app";

describe("/auth/login", () => {
  let connection;
  let userRepository; //TODO: starts from here...

  const userData = { email: "onkarchougule@gmail.com", password: "secret@123" };
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
      console.log("Database dropped successfully.");
      await connection.synchronize();
      userRepository = connection.getRepository(User);
      // await truncateTable(connection);
    }
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  })
}) */
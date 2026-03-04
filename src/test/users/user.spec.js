import {
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
  let userRepository;

  const selfRoute = async () => {
    return await request(app).get("/auth/self").send();
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
  });

  it("should return 200 status code", async () => {
    const response = await selfRoute();
    expect(response.statusCode).toBe(200);
  });
});

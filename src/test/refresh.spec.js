import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import request from "supertest";
import app from "../app";

describe("/auth/refresh", () => {
  let connection;
  // let userRepository;

  const refreshToken = () => {
    return request(app).post("/auth/refresh").send();
  };

  beforeAll(async () => {
    try {
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.error(
        "error iniializing Error during Data Source initialization:",
        error,
      );
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      if (connection & connection.isInitialized) {
        await connection.DropDatabase();
        await connection.synchronize();
        //   userRepository = connection.getRepository(User);
      }
    } catch (error) {
      console.error(
        "error during dropping and synchronizing the database:",
        error,
      );
      throw error;
    }
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return 200 status code", async () => {
    const response = await refreshToken();
    expect(response.statusCode).toBe(200);
  });
});

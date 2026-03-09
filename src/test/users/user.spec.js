import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from "@jest/globals";
import { AppDataSource } from "../../config/data-source.js";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import { User } from "../../entity/User.js";
import app from "../../app.js";
import { Roles } from "../../constants/index.js";

describe("/auth/self", () => {
  let connection;
  let jwksMock;
  let userRepository;

  let registerData = {
    firstName: "onkar",
    lastName: "chougule",
    email: "onkarchougule@gmail.com",
    password: "secret@123",
  };

  const selfRoute = async (accessToken) => {
    return await request(app)
      .get("/auth/self")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send();
  };

  beforeAll(async () => {
    try {
      jwksMock = createJWKSMock("http://localhost:3000");
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.error("Error during Data Source initialization:", error);
      throw error; // Fail the test immediately if DB doesn't start
    }
  });

  beforeEach(async () => {
    jwksMock.start();
    if (connection && connection.isInitialized) {
      await connection.dropDatabase();
      console.log("Database dropped successfully.");
      await connection.synchronize();
      userRepository = connection.getRepository(User); // getting userRepo here only when a new empty clean database is created
      // await truncateTable(connection);
    }
  });

  afterEach(() => {
    jwksMock.stop();
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return 200 status code", async () => {
    let accessToken = await jwksMock.token(
      {
        sub: "213434",
        role: "customer",
      },
      { issuer: "auth-service" },
    );
    const response = await selfRoute(accessToken);
    expect(response.statusCode).toBe(200);
  });

  it("should return tokens", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    let accessToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: user.role,
      },
      { issuer: "auth-service" },
    );

    let response = await selfRoute(accessToken);
    expect(Number(response.body.id)).toBe(user.id);
  });

  it("should not return password field", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    let accessToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: user.role,
      },
      { issuer: "auth-service" },
    );

    let response = await selfRoute(accessToken);
    expect(Number(response.body)).not.toHaveProperty("password");
  });
});

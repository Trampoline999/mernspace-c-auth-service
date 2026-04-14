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
    await jwksMock.start();
    if (connection && connection.isInitialized) {
      await connection.dropDatabase();
      // console.log("Database dropped successfully.");
      await connection.synchronize();
      userRepository = await connection.getRepository(User); // getting userRepo here only when a new empty clean database is created
      // await truncateTable(connection);
    }
  });

  afterEach(async () => {
    await jwksMock.stop();
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return 200 status code", async () => {
    // Create a user first
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
    const response = await selfRoute(accessToken);
    console.log(response.body);
    expect(response.statusCode).toBe(200);
  });

  it("should return user details", async () => {
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
      console.log(accessToken);
    const response = await selfRoute(accessToken);
    console.log(response.body);
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

    const response = await selfRoute(accessToken);
    expect(response.body).not.toHaveProperty("password");
  });

  it("should 401 if authorization token does not exists", async () => {
    await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    let response = await selfRoute();
    expect(response.statusCode).toBe(401);
  });
});

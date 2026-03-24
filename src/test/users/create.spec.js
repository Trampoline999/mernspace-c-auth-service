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

describe("/users", () => {
  let connection;
  let jwksMock;
  let userRepository;

  let registerData = {
    firstName: "onkar",
    lastName: "chougule",
    email: "onkarchougule@gmail.com",
    password: "secret@123",
    tenantId: "1",
  };

  const selfRoute = async (accessToken) => {
    return await request(app)
      .get("/users")
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
      // console.log("Database dropped successfully.");
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

  it("should return tokens", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.MANAGER,
    });

    let accessToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: user.role,
      },
      { issuer: "auth-service" },
    );

    let response = await selfRoute(accessToken);
    expect(users).toHaveLength(1);
  });
});

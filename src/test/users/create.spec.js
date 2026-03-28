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
import { Tenant } from "../../entity/Tenants.js";

describe("/users", () => {
  let connection;
  let jwksMock;
  let userRepository;
  let tenantRepository;

  let registerData = {
    firstName: "onkar",
    lastName: "chougule",
    email: "onkarchougule@gmail.com",
    password: "secret@123",
  };

  const getUsers = async (adminToken) => {
    return await request(app)
      .get("/users")
      .set("Cookie", [`accessToken=${adminToken}`])
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
      userRepository = connection.getRepository(User);
      tenantRepository = connection.getRepository(Tenant);
      
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
    const tenant = await tenantRepository.save({ name: "Test Tenant", address: "Test Address" });
    let user = await userRepository.save({
      ...registerData,
      tenantId:tenant.id,
      role: Roles.MANAGER,
    });

    let accessToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: Roles.ADMIN,
      },
      { issuer: "auth-service" },
    );

    await getUsers(accessToken);

    const users = await userRepository.find({});
    expect(users).toHaveLength(1);
  });
});

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

  const getUsers = async (registerData,adminToken) => {
    return await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(registerData);
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
    if (connection && connection.isInitialized) {
      await connection.dropDatabase();
      //  console.log("Database dropped successfully.");
      await connection.synchronize();
      userRepository = connection.getRepository(User);
      tenantRepository = connection.getRepository(Tenant);
    }
    await jwksMock.start();
  });

  afterEach(async () => {
    await jwksMock.stop();
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return token", async () => {
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

    console.log(accessToken)

    await getUsers(registerData,accessToken);

    const users = await userRepository.find({});
    expect(users).toHaveLength(1);
  });

  it("should get all users", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.MANAGER,
    });

    let adminToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: Roles.ADMIN,
      },
      { issuer: "auth-service" },
    );

    const response = await request(app)
      .get("/users")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send();

    expect(response.statusCode).toBe(201);
    expect(response.body.users).toHaveLength(1);
  });

  it("should get user by id", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    let userToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: Roles.CUSTOMER,
      },
      { issuer: "auth-service" },
    );

    const response = await request(app)
      .get(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${userToken}`])
      .send();

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBe(user.id);
  });

  it("should update user", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    let adminToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: Roles.ADMIN,
      },
      { issuer: "auth-service" },
    );

    const response = await request(app)
      .patch(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${adminToken}`])
      .send({
        firstName: "Updated",
        lastName: "Name",
        email: "updated@gmail.com",
        role: Roles.CUSTOMER,
      });

    expect(response.statusCode).toBe(200);
    const updatedUser = await userRepository.findOne({ where: { id: user.id } });
    expect(updatedUser.firstName).toBe("Updated");
  });

  it("should delete user", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    let adminToken = await jwksMock.token(
      {
        sub: String(user.id),
        role: Roles.ADMIN,
      },
      { issuer: "auth-service" },
    );

    const response = await request(app)
      .delete(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${adminToken}`])
      .send();

    expect(response.statusCode).toBe(201);
    const deletedUser = await userRepository.findOne({ where: { id: user.id } });
    expect(deletedUser).toBeNull();
  });
});

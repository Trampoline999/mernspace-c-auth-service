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

  const adminUserData = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "secret@123",
    role: Roles.ADMIN,
  };

  const newUserData = {
    firstName: "Onkar",
    lastName: "Chougule",
    email: "onkarchougule@example.com",
    password: "secret@123",
    role: Roles.MANAGER,
  };

  const createUser = async (userData, adminToken) => {
    const req = request(app).post("/users").send(userData);
    if (adminToken) {
      req.set("Cookie", [`accessToken=${adminToken}`]);
    }
    return await req;
  };

  beforeAll(async () => {
    try {
      jwksMock = createJWKSMock("http://localhost:3000");
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.error("Error during Data Source initialization:", error);
      throw error;
    }
  });

  beforeEach(async () => {
    if (connection && connection.isInitialized) {
      await connection.dropDatabase();
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

  describe("POST /users", () => {
    it("should create a user successfully and return 201", async () => {
      const tenant = await tenantRepository.save({
        name: "Test Tenant",
        address: "Test Address",
      });

      const adminUser = await userRepository.save(adminUserData);
      const adminToken = await jwksMock.token(
        {
          sub: String(adminUser.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
      );

      const response = await createUser(
        {
          ...newUserData,
          tenantId: tenant.id,
        },
        adminToken
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");

      const savedUser = await userRepository.findOne({
        where: { email: newUserData.email },
      });
      expect(savedUser).not.toBeNull();
      expect(savedUser.firstName).toBe(newUserData.firstName);
      expect(savedUser.lastName).toBe(newUserData.lastName);
      expect(savedUser.role).toBe(newUserData.role);
    });

    it("should return 400 if email already exists", async () => {
      const adminUser = await userRepository.save(adminUserData);
      const adminToken = await jwksMock.token(
        {
          sub: String(adminUser.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
      );

      // Save user with same email first
      await userRepository.save(newUserData);

      const response = await createUser(newUserData, adminToken);
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await createUser(newUserData);
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 if user is not Admin", async () => {
      const managerToken = await jwksMock.token(
        {
          sub: "2",
          role: Roles.MANAGER,
        },
        { issuer: "auth-service" }
      );

      const response = await createUser(newUserData, managerToken);
      expect(response.statusCode).toBe(403);
    });
  });

  describe("GET /users", () => {
    it("should get all users", async () => {
      const user = await userRepository.save(adminUserData);

      const adminToken = await jwksMock.token(
        {
          sub: String(user.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
      );

      const response = await request(app)
        .get("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send();

      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.perPage).toBe(10);
    });

    it("should paginate users based on currentPage and perPage query params", async () => {
      const firstUser = await userRepository.save(adminUserData);
      await userRepository.save({
        ...newUserData,
        email: "second@gmail.com",
        role: Roles.CUSTOMER,
      });

      const adminToken = await jwksMock.token(
        {
          sub: String(firstUser.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
      );

      const response = await request(app)
        .get("/users?currentPage=2&perPage=1")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send();

      expect(response.statusCode).toBe(201);
      expect(response.body.currentPage).toBe(2);
      expect(response.body.perPage).toBe(1);
      expect(response.body.total).toBe(2);
      expect(response.body.data).toHaveLength(1);
    });

    it("should filter users by search term in firstName, lastName, or email", async () => {
      const admin = await userRepository.save(adminUserData);
      await userRepository.save({
        firstName: "Alice",
        lastName: "Wonderland",
        email: "alice@example.com",
        password: "secret@123",
        role: Roles.CUSTOMER,
      });
      await userRepository.save({
        firstName: "Bob",
        lastName: "Builder",
        email: "bob@example.com",
        password: "secret@123",
        role: Roles.MANAGER,
      });

      const adminToken = await jwksMock.token(
        {
          sub: String(admin.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
      );

      // Search by first name
      const searchRes = await request(app)
        .get("/users?search=Alice")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send();

      expect(searchRes.statusCode).toBe(201);
      expect(searchRes.body.total).toBe(1);
      expect(searchRes.body.data[0].firstName).toBe("Alice");

      // Search by email
      const emailRes = await request(app)
        .get("/users?search=bob@example.com")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send();

      expect(emailRes.statusCode).toBe(201);
      expect(emailRes.body.total).toBe(1);
      expect(emailRes.body.data[0].firstName).toBe("Bob");
    });

    it("should filter users by role query param", async () => {
      const admin = await userRepository.save(adminUserData);
      await userRepository.save({
        firstName: "Alice",
        lastName: "Wonderland",
        email: "alice@example.com",
        password: "secret@123",
        role: Roles.CUSTOMER,
      });
      await userRepository.save({
        firstName: "Bob",
        lastName: "Builder",
        email: "bob@example.com",
        password: "secret@123",
        role: Roles.MANAGER,
      });

      const adminToken = await jwksMock.token(
        {
          sub: String(admin.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
      );

      const response = await request(app)
        .get(`/users?role=${Roles.MANAGER}`)
        .set("Cookie", [`accessToken=${adminToken}`])
        .send();

      expect(response.statusCode).toBe(201);
      expect(response.body.total).toBe(1);
      expect(response.body.data[0].role).toBe(Roles.MANAGER);
    });
  });

  describe("GET /users/:id", () => {
    it("should get user by id", async () => {
      const user = await userRepository.save(newUserData);

      const userToken = await jwksMock.token(
        {
          sub: String(user.id),
          role: Roles.CUSTOMER,
        },
        { issuer: "auth-service" }
      );

      const response = await request(app)
        .get(`/users/${user.id}`)
        .set("Cookie", [`accessToken=${userToken}`])
        .send();

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBe(user.id);
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update user", async () => {
      const user = await userRepository.save(newUserData);

      const adminToken = await jwksMock.token(
        {
          sub: String(user.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
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
  });

  describe("DELETE /users/:id", () => {
    it("should delete user", async () => {
      const user = await userRepository.save(newUserData);

      const adminToken = await jwksMock.token(
        {
          sub: String(user.id),
          role: Roles.ADMIN,
        },
        { issuer: "auth-service" }
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
});

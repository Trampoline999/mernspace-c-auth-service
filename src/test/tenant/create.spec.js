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
import request from "supertest";
import createJWKSMock from "mock-jwks";
import app from "../../app.js";
import { Tenant } from "../../entity/Tenants.js";
import { Roles } from "../../constants/index.js";




describe("POST /tenants", () => {
  let connection;
  let tenantRepository;
  let jwksMock;
  let adminToken;

  const tenantData = {
    name: "Baskin robin",
    address: "2nd Rd BabaNagar yelahanka",
  };

  const createTenant = async (tenantData = {}, accessToken) => {
    return await request(app)
      .post("/tenants")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(tenantData);
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
      tenantRepository = await connection.getRepository(Tenant);
    }

    adminToken = await jwksMock.token({
      sub: "1",
      role: Roles.ADMIN,
    });
  });

  afterEach(async () => {
    await jwksMock.stop();
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return 201 status code", async () => {
    const response = await createTenant(tenantData, adminToken);
    expect(response.statusCode).toBe(201);
  });

  it("should return name and address of tenant", async () => {
    await createTenant(tenantData, adminToken);
    const tenants = await tenantRepository.find({});

    expect(tenants).toHaveLength(1);
    expect(tenants[0].name).toBe(tenantData.name);
    expect(tenants[0].address).toBe(tenantData.address);
  });

  it("should return 401 if user is not authenticated", async () => {
    const response = await createTenant(tenantData);

    expect(response.statusCode).toBe(401);
    const tenants = await tenantRepository.find({});

    expect(tenants).toHaveLength(0);
  });

  it("should return 403 if user is not Manager", async () => {
    const managerToken = await jwksMock.token({
      sub: "1",
      role: Roles.MANAGER,
    });
    const response = await createTenant(tenantData, managerToken);

    expect(response.statusCode).toBe(403);
    const tenants = await tenantRepository.find({});

    expect(tenants).toHaveLength(0);
  });
});

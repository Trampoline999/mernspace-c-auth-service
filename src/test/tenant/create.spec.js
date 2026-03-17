import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import { AppDataSource } from "../../config/data-source.js";
import request from "supertest";
import app from "../../app.js";
import { Tenant } from "../../entity/Tenants.js";

describe("POST /tenants", () => {
  let connection;
  let tenantRepository;

  const tenantData = {
    name: "Naturals",
    address: "2nd Rd BabaNagar yelahanka",
  };

  const createTenant = async (tenantData = {}) => {
    return request(app).post("/tenants").send(tenantData);
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
      // console.log("Database dropped successfully.");
      await connection.synchronize();
      tenantRepository = await connection.getRepository(Tenant);
    }
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return 201 status code", async () => {
    const response = await createTenant(tenantData);
    expect(response.statusCode).toBe(201);
  });

  it("should return name and address of tenant", async () => {
    await createTenant(tenantData);
    const tenants = await tenantRepository.find({});

    expect(tenants).toHaveLength(1);
    expect(tenants[0].name).toBe(tenantData.name);
    expect(tenants[0].address).toBe(tenantData.address);
  });
});

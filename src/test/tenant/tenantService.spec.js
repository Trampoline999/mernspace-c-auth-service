import { describe, it, expect, jest } from "@jest/globals";
import { TenantService } from "../../services/TenantService.js";

describe("TenantService Unit Tests", () => {
  it("should create a tenant", async () => {
    const mockRepo = {
      save: jest.fn().mockResolvedValue({ id: 1, name: "T1", address: "A1" }),
    };
    const service = new TenantService(mockRepo);
    const result = await service.create({ name: "T1", address: "A1" });

    expect(result).toEqual({ id: 1, name: "T1", address: "A1" });
    expect(mockRepo.save).toHaveBeenCalledWith({ name: "T1", address: "A1" });
  });

  it("should throw 500 if creating tenant fails", async () => {
    const mockRepo = {
      save: jest.fn().mockRejectedValue(new Error("DB error")),
    };
    const service = new TenantService(mockRepo);
    await expect(service.create({ name: "T1", address: "A1" })).rejects.toThrow(
      "error during creating tenant Data",
    );
  });

  it("should get all tenants", async () => {
    const tenantsList = [{ id: 1, name: "T1", address: "A1" }];
    const mockRepo = {
      find: jest.fn().mockResolvedValue(tenantsList),
    };
    const service = new TenantService(mockRepo);
    const result = await service.getAllTenants();

    expect(result).toEqual(tenantsList);
  });

  it("should throw 500 if getAllTenants fails", async () => {
    const mockRepo = {
      find: jest.fn().mockRejectedValue(new Error("DB error")),
    };
    const service = new TenantService(mockRepo);
    await expect(service.getAllTenants()).rejects.toThrow("error finding tenants data");
  });

  it("should get tenant by id", async () => {
    const tenant = { id: 1, name: "T1", address: "A1" };
    const mockRepo = {
      findOne: jest.fn().mockResolvedValue(tenant),
    };
    const service = new TenantService(mockRepo);
    const result = await service.getTenantById(1);

    expect(result).toEqual(tenant);
  });

  it("should throw 500 if getTenantById fails", async () => {
    const mockRepo = {
      findOne: jest.fn().mockRejectedValue(new Error("DB error")),
    };
    const service = new TenantService(mockRepo);
    await expect(service.getTenantById(1)).rejects.toThrow("error finding tenants data");
  });

  it("should update tenant by id", async () => {
    const existing = { id: 1, name: "Old", address: "Old Addr" };
    const mockRepo = {
      findOne: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockImplementation((t) => Promise.resolve(t)),
    };
    const service = new TenantService(mockRepo);
    const result = await service.updateTenantById(1, {
      name: "New",
      address: "New Addr",
    });

    expect(result.name).toBe("New");
    expect(result.address).toBe("New Addr");
  });

  it("should throw 500 if updateTenantById fails", async () => {
    const mockRepo = {
      findOne: jest.fn().mockRejectedValue(new Error("DB error")),
    };
    const service = new TenantService(mockRepo);
    await expect(
      service.updateTenantById(1, { name: "N", address: "A" }),
    ).rejects.toThrow("error while updating tenants data");
  });

  it("should delete tenant by id", async () => {
    const mockRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1, name: "T1" }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const service = new TenantService(mockRepo);
    const result = await service.deleteTenantById(1);

    expect(result).toEqual({ affected: 1 });
  });

  it("should throw 404 if tenant to delete is not found", async () => {
    const mockRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const service = new TenantService(mockRepo);
    await expect(service.deleteTenantById(99)).rejects.toThrow("Tenant with id 99 not found");
  });

  it("should throw 500 if delete fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const mockRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      delete: jest.fn().mockRejectedValue(new Error("Delete failed")),
    };
    const service = new TenantService(mockRepo);
    await expect(service.deleteTenantById(1)).rejects.toThrow("error deleting tenant data");
    consoleSpy.mockRestore();
  });
});


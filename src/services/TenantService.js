import { matchedData } from "express-validator";
import createHttpError from "http-errors";

export class TenantService {
  constructor(tenantRepository) {
    this.tenantRepository = tenantRepository;
  }
  async create({ name, address }) {
    try {
      return await this.tenantRepository.save({ name, address });
    } catch {
      const err = createHttpError(500, "error during creating tenant Data");
      throw err;
    }
  }

  async getAllTenants(validatedQuery = {}) {
    const { currentPage = 1, perPage = 10 } = validatedQuery;
    try {
      const queryBuilder = await this.tenantRepository.createQueryBuilder();

      const result = await queryBuilder
        .skip((currentPage - 1) * perPage)
        .take(perPage)
        .getManyAndCount();
      return result;

    } catch {
      const err = createHttpError(500, "error finding tenants data");
      throw err;
    }
  }

  async getTenantById(id) {
    try {
      return await this.tenantRepository.findOne({ where: { id } });
    } catch {
      const err = createHttpError(500, "error finding tenants data");
      throw err;
    }
  }

  async updateTenantById(id, { name, address }) {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: {
          id: id,
        },
      });

      tenant.name = name;
      tenant.address = address;

      return await this.tenantRepository.save(tenant);
    } catch {
      const err = createHttpError(500, "error while updating tenants data");
      throw err;
    }
  }

  async deleteTenantById(id) {

    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      const err = createHttpError(404, `Tenant with id ${id} not found`);
      throw err;
    }
    try {
      return await this.tenantRepository.delete(id);
    } catch (error) {
      console.error("Delete error:", error.message);
      const err = createHttpError(500, "error deleting tenant data");
      throw err;
    }
  }
}

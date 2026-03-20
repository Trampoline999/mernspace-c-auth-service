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

  async getAllTenants() {
    try {
      return await this.tenantRepository.find({});
    } catch {
      const err = createHttpError(500, "error finding tenants data");
      throw err;
    }
  }

  async getTenantById(id) {
    try {
      return await this.tenantRepository.findOne({ id: id });
    } catch {
      const err = createHttpError(500, "error finding tenants data");
      throw err;
    }
  }
}

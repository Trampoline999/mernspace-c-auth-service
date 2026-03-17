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
}

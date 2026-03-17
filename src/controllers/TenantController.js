export class TenantController {
  tenantService;
  logger;
  constructor(tenantService, logger) {
    this.tenantService = tenantService;
    this.logger = logger;
  }
  async create(req, res, next) {
    const { name, address } = req.body;

    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info("tenant has been created.", { id: tenant.id });
      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
      return;
    }
  }
}

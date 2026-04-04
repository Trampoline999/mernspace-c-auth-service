import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class TenantController {
  tenantService;
  logger;
  constructor(tenantService, logger) {
    this.tenantService = tenantService;
    this.logger = logger;
  }

  async create(req, res, next) {
    const { name, address } = req.body;
    
    const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info("tenant has been created.", { id: tenant.id });
      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
      return;
    } 
  }

  async getAllTenants(req, res, next) {
    try {
      const tenants = await this.tenantService.getAllTenants();
      res.status(200).json({ tenants });
    } catch (err) {
      next(err);
      return;
    }
  }

  async getTenant(req, res, next) {
    const id = req.params.id;
    try {
      const tenant = await this.tenantService.getTenantById(Number(id));
      if (!tenant) {
        const err = createHttpError(404, `Tenant with id ${id} not found`);
        next(err);
        return;
      }
      res.status(200).json({ id: tenant.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async updateTenant(req, res, next) {
    const id = req.params.id;
    const { name, address } = req.body;
    const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
    try {
      const tenant = await this.tenantService.updateTenant(Number(id), {
        name,
        address,
      });
      res.status(200).json({ id: tenant.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async deleteTenant(req, res, next) {
    const id = req.params.id;
    try {
      await this.tenantService.getTenantById(Number(id));
      res.status(200).json({});
    } catch (err) {
      next(err);
      return;
    }
  }
}

import express from "express";
import { TenantController } from "../controllers/tenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenants";
import logger from "../config/logger.js";
import { authenticate } from "../middleware/authenticate.js";
import { canAccess } from "../middleware/canAccess.js";
import { Roles } from "../constants/index.js";

const tenantRouter = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenant = new TenantController(tenantService, logger);

tenantRouter.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenant.create(req, res, next),
);

tenant.get("/tenants", (req, res, next) =>
  tenant.getAllTenants(req, res, next),
);
tenant.get("/tenants/:id", (req, res, next) =>
  tenant.getTenant(req, res, next),
);

tenantRouter.post(
  "/tenants/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenant.updateTenant(req, res, next),
);

tenantRouter.delete(
  "/tenants/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenant.deleteTenant(req, res, next),
);

export default tenantRouter;

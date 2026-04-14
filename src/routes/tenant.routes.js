import express from "express";
import { TenantController } from "../controllers/TenantController.js";
import { TenantService } from "../services/tenantService.js";
import { AppDataSource } from "../config/data-source.js";
import { Tenant } from "../entity/Tenants.js";
import logger from "../config/logger.js";
import { authenticate } from "../middleware/authenticate.js";
import { canAccess } from "../middleware/canAccess.js";
import { Roles } from "../constants/index.js";

import  tenantValidator  from "../validators/tenant-validator.js";

const tenantRouter = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenant = new TenantController(tenantService, logger);

tenantRouter.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req, res, next) => tenant.create(req, res, next),
);

tenantRouter.get("/", (req, res, next) =>
  tenant.getAllTenants(req, res, next),
);
tenantRouter.get("/tenants/:id",canAccess([Roles.ADMIN]), (req, res, next) =>
  tenant.getTenant(req, res, next),
);

tenantRouter.post(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req, res, next) => tenant.updateTenant(req, res, next),
);

tenantRouter.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenant.deleteTenant(req, res, next),
);

export default tenantRouter;

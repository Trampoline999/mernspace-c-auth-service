import express from "express";
import { TenantController } from "../controllers/tenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenants";
import logger from "../config/logger.js";
import { authenticate } from "../middleware/authenticate.js";

const tenantRouter = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenant = new TenantController(tenantService, logger);

tenantRouter.post("/", authenticate, (req, res, next) =>
  tenant.create(req, res, next),
);

export default tenantRouter;

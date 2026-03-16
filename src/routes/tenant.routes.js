import express from "express";
import { TenantController } from "../controllers/tenantController";

const tenant = new TenantController();

const tenantRouter = express.Router();

tenantRouter.post("/", (req, res) => tenant.create(req, res));

export default tenantRouter;

import express from "express";

const tenantRouter = express.Router();

tenantRouter.post("/", (req, res) => {
  res.json({});
});

export default tenantRouter;

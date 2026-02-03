import express from "express";
import { Config } from "./config/config.js";
import process from "process";
import logger from "./config/logger.js";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "auth-service is running",
  });
  //res.send("Auth-service is running...");
});

const StartServer = () => {
  try {
    const port = Config.PORT || 1337;
    app.listen(port, () => {
      logger.info(`server is listening on port : ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
StartServer();

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.message);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;

import { Config } from "./config/config.js";
import process from "process";
import logger from "./config/logger.js";
import app from "./app.js";


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

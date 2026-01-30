import express from "express";
import { Config } from "./config/config.js";
import process from "process";

const app = express();

app.get("/", (req, res) => {
  res.send("Auth-service is running...");
});

const StartServer = () => {
  try {
    const port = Config.PORT || 1337;
    app.listen(port, () => console.log("app is listening on port : ", port));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

StartServer();

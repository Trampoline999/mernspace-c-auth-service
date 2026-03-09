import express from "express";
import logger from "./config/logger.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public", { dotfiles: "allow" }));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "auth-service is running",
  });
});

app.use("/auth", authRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
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

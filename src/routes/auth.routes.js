import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { userService } from "../services/userService";

const authRouter = express.Router();
const userService = new userService();
const authController = new AuthController({ userService });

authRouter.post("/register", (req, res) => authController.register(req, res));

export default authRouter;

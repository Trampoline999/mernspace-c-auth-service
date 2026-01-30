import dotenv from "dotenv";
import process from "process";
dotenv.config();

const { PORT, NODE_ENV } = process.env;

export const Config = { PORT, NODE_ENV };

import dotenv from "dotenv";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const { PORT, DB_PORT, NODE_ENV, DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME } =
  process.env;

export const Config = {
  PORT,
  DB_PORT,
  NODE_ENV,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_USERNAME,
};

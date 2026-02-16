import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User.js";
import { Config } from "./config.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Config.DB_PORT,
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // don't use this in production...
  synchronize: false,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});

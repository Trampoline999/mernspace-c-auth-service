import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { AppDataSource } from "../../config/data-source.js";
import { User } from "../../entity/User";
import request from "supertest";
import app from "../../app";
import { Roles } from "../../constants/index.js";
import jwt from "jsonwebtoken";
import { Config } from "../../config/config.js";
import { RefreshToken } from "../../entity/RefreshToken.js";

describe("/auth/refresh", () => {
  let userRepository;
  let refreshTokenRepository;
  let connection;
  let registerData = {
    firstName: "onkar",
    lastName: "chougule",
    email: "onkarchougule@gmail.com",
    password: "secret@123",
  };

  const refreshToken = (refreshToken) => {
    return request(app)
      .post("/auth/refresh")
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .send();
  };

  beforeAll(async () => {
    try {
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.error(
        "error iniializing Error during Data Source initialization:",
        error,
      );
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      if (connection && connection.isInitialized) {
        await connection.dropDatabase();
        await connection.synchronize();
        userRepository = connection.getRepository(User);
        refreshTokenRepository = connection.getRepository(RefreshToken);
      }
    } catch (error) {
      console.error(
        "error during dropping and synchronizing the database:",
        error,
      );
      throw error;
    }
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  it("should return 200 status code", async () => {
    let user = await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    const newRefreshtoken = await refreshTokenRepository.save({
      user: user,
      updatedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });
    const payload = {
      sub: String(user.id),
      role: user.role,
      id: String(newRefreshtoken.id),
    };

    const token = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "auth-service",
      jwtid: String(newRefreshtoken.id),
    });

    const response = await refreshToken(token);

    expect(response.statusCode).toBe(200);
  });

  it("should 401 if authorization token does not exists", async () => {
    await userRepository.save({
      ...registerData,
      role: Roles.CUSTOMER,
    });

    let response = await refreshToken();
    expect(response.statusCode).toBe(401);
  });
});

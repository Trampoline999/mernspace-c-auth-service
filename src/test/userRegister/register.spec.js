import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app";

describe("POST /auth/register", () => {
  describe("Given all test fields", () => {
    it("should return 200 status code", async () => {
      //Arrange
      const userData = {
        firstName: "onkar",
        lastName: "chougule",
        email: "onkarchougule@gmail.com",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //assert
      expect(response.statusCode).toBe(201);
    });

    it("should return json response", async () => {
      const userData = {
        firstName: "onkar",
        lastName: "chougule",
        email: "onkarchougule@gmail.com",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      //assert
      expect(response.type).toBe("application/json");
    });

    it("should return user from database", async () => {
      const userData = {
        firstName: "onkar",
        lastName: "chougule",
        email: "onkarchougule@gmail.com",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      //assert
    });
  });

  describe("Fields are missing", () => {});
});

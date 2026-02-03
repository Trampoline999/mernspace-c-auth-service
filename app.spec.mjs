import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import sum from "./src/utils/utils.js";
import app from "./src/index.js";

describe("App", () => {
  test("should work", () => {
    const result = sum(10, 20);
    expect(result).toBe(30);
  });

  test("should give status code :200", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});

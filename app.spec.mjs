import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "./src/app.js";

describe.skip("App", () => {

  test("should give status code :200", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});

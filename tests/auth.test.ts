import request from "supertest";
import app from "../src/server.ts";
import env from "../env.ts";
import { afterEach } from "vitest";
import { createTestUser, cleanupDatabase } from "./setup/dbHelpers.ts";

describe("Authentication Endpoints", () => {
  afterEach(async () => {
    await cleanupDatabase();
  });
  describe("POST /auth/register", () => {
    it("should register a new user with valid data", async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        password: "TestPassword123!",
        firstName: "Test",
        lastName: "User",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User created successfully",
      );
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 400 for invalid email", async () => {
      const userData = {
        email: "invalid-email",
        username: `testuser-${Date.now()}`,
        password: "TestPassword123!",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should return 400 for short password", async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        password: "short",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });
  });

  describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
      // Create a test user first
      const password = "TestPassword123!";
      const { user } = await createTestUser({
        email: `test-${Date.now()}@example.com`,
        password,
      });

      const credentials = {
        email: user.email,
        password,
      };

      const response = await request(app)
        .post("/auth/login")
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 400 for missing email", async () => {
      const credentials = {
        password: "TestPassword123!",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should return 401 for invalid credentials", async () => {
      // Create a test user first
      const { user } = await createTestUser();

      const credentials = {
        email: user.email,
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });
});

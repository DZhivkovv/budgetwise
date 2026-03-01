import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals"
import { Sequelize } from "sequelize"
import { sequelize } from "../../../../db/testDb.js"
import jwt from "jsonwebtoken"

import { authenticateUser } from "../../../authService.js"
import { createTestUser, clearUsers } from "../../../helpers/auth/fixtures.js"

import UserModel from "../../../../models/user.model.js"
const User = UserModel(sequelize, Sequelize);

describe("authenticateUser – DB integration (SQLite)", () => {
  let user;
  let password;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret"
    process.env.SALT_ROUNDS = "10"
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await sequelize.close()
  })

  // Create a test user before each test.
  beforeEach(async () => {
    ({ plainPassword: password, ...user } = await createTestUser());
  });

  // Remove all User records in the test database After each test.
  afterEach(async () => {
    await clearUsers();
  });

  // Success test cases:
  describe("authenticateUser - success cases", () => {
    it("returns token and user data on successful authentication", async () => {
      const result = await authenticateUser(user.email, password, User)

      expect(result.token).toBeDefined()
      expect(result.user).toEqual({
        id: expect.any(Number),
        email: user.email,
        firstName: user.firstName
      })

      const decoded = jwt.verify(result.token, process.env.JWT_SECRET)
      expect(decoded.email).toBe(user.email)
    })
  });

  // Failure test cases:
  describe("authenticateUser - failure cases", () => {
    it("throws 400 if email is missing", async () => {
      await expect(authenticateUser(null, password, User)).rejects.toEqual({
        status: 400,
        message: "Email is required"
      })
    });

    it("throws 400 if password is missing", async () => {
      await expect(authenticateUser(user.email, null, User)).rejects.toEqual({
        status: 400,
        message: "Password is required"
      })
    });
    
    it("throws 401 if email does not exist", async () => {
      await expect(authenticateUser("nope@example.com", password, User)).rejects.toEqual({
        status: 401,
        message: "Invalid email or password"
      })
    });

    it("throws 401 if password is incorrect", async () => {
      await expect(authenticateUser(user.email, "WrongPassword123!", User)).rejects.toEqual({
        status: 401,
        message: "Invalid email or password"
      })
    });
  });

});
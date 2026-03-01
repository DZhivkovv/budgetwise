import bcrypt from "bcrypt";
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals";
import { Sequelize } from "sequelize";
import { sequelize } from "../../../../db/testDb.js";

import { registerUser } from "../../../authService.js";
import { clearUsers } from "../../../helpers/auth/fixtures.js";

import UserModel from "../../../../models/user.model.js"
const User = UserModel(sequelize, Sequelize)

describe("registerUser – DB integration (SQLite)", () => {

  // Test user data.
  const payload = {
    firstName: "John",
    lastName: "Doe",
    age: 25,
    email: "john@example.com",
    password: "Password123!",
    confirmPassword: "Password123!"
  }

  beforeAll(async () => {
    process.env.SALT_ROUNDS = "10"
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await sequelize.close()
  })

  // Remove all User records in the test database After each test.
  afterEach(async () => {
    await clearUsers();
  });

  /**
   * Success scenarios for user registration.
   */
  describe("registerUser - success cases", () => {
    it("creates user in the database with hashed password", async () => {
      const user = await registerUser(payload, User) // pass the test SQLite User
      expect(user.id).toBeDefined()
      expect(user.email).toBe(payload.email)

      const dbUser = await User.findOne({ where: { email: payload.email } })
      expect(dbUser).not.toBeNull()

      const passwordMatches = await bcrypt.compare(payload.password, dbUser.password)
      expect(passwordMatches).toBe(true)
    })
  })
  
  /**
   * Failure scenarios for user registration.
   */
  describe("registerUser - failure cases", () => {

    it("should throw 409 if email already exists", async () => {
      await registerUser(payload, User)
      await expect(registerUser(payload, User)).rejects.toEqual({
        status: 409,
        message: "The email is already in use by another user."
      })
    })
  })

})

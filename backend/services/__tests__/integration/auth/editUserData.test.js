import bcrypt from "bcrypt";
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals";
import { Sequelize } from "sequelize";
import { sequelize } from "../../../../db/testDb.js";
import { editUserData } from "../../../authService.js";
import { createTestUser, clearUsers } from "../../../helpers/auth/fixtures.js"

import UserModel from "../../../../models/user.model.js";
const User = UserModel(sequelize, Sequelize)

/**
 * Integration tests for editUserData.
 * Verifies DB-level updates using SQLite + Sequelize.
 */
describe("editUserData – DB integration (SQLite)", () => {
  let user;
  let password;

  beforeAll(async () => {
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
  })


  /**
   * Success scenarios for user registration.
   * Tests updating email, password, and both together.
  */
  describe('editUserData - success cases', () => { 
    
    it("should update user email address successfully", async () => {
      const newEmail = "newjohn@example.com"
      const updatedUser = await editUserData(user.id, { newEmail }, User)

      await updatedUser.reload()
      expect(updatedUser.email).toBe(newEmail)

      const dbUser = await User.findByPk(user.id)
      expect(dbUser.email).toBe(newEmail)
    });

    it("should update user password successfully", async () => {
      const newPassword = "NewPassword123!"
      const updatedUser = await editUserData(user.id, { newPassword }, User)

      await updatedUser.reload()
      const passwordMatches = await bcrypt.compare(newPassword, updatedUser.password)
      expect(passwordMatches).toBe(true)
    });

    it("should update email AND password successfully", async () => {
      const newEmail = "combined@example.com"
      const newPassword = "Combined123!"
      const updatedUser = await editUserData(user.id, { newEmail, newPassword }, User)

      await updatedUser.reload()
      expect(updatedUser.email).toBe(newEmail)

      const passwordMatches = await bcrypt.compare(newPassword, updatedUser.password)
      expect(passwordMatches).toBe(true)
    });
  });

  
  /**
   * Failure scenarios for editing user data.
   * Tests invalid inputs, duplicates, and missing user.
   */
  describe('editUserData - failure cases', () => { 

    it("should throw 404 if user is not found", async () => {
      await expect(editUserData(9999, { newEmail: "x@example.com" }, User)).rejects.toEqual({
        status: 404,
        message: "User not found"
      })
    });

    it("should throw 400 if no new email or password is provided", async () => {
      await expect(
        editUserData(user.id, {}, User)
      ).rejects.toEqual({
        status: 400,
        message: "Please provide new email or password"
      })
    });

    it("should throw 400 if the new email address is invalid", async () => {
      await expect(editUserData(user.id, { newEmail: "invalid-email" }, User)).rejects.toEqual({
        status: 400,
        message: "Invalid email format"
      })
    });

    it("should throw 409 if the new email already exists", async () => {
      const anotherUser = await User.create({
        firstName: "Jane",
        lastName: "Doe",
        age: 30,
        email: "jane@example.com",
        password: await bcrypt.hash(password, 10)
      });

      await expect(editUserData(user.id, { newEmail: anotherUser.email }, User)).rejects.toEqual({
        status: 409,
        message: "Email is already in use."
      });
    });

    it("should throw 400 if the new password does not meet the requirements", async () => {
      await expect(editUserData(user.id, { newPassword: "weak" }, User)).rejects.toEqual({
        status: 400,
        message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      });
    });
  });

});
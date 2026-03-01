import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import validateRegistrationData from "../utils/validation/validateRegistrationData.js";
import db from "../models/index.js";

/**
 * Authenticate a user by verifying credentials and issuing a JWT.
 * * @param {string} email
 * @param {string} password
 * @param {Object} UserModel - Dependency injection for testing/flexibility
 * @returns {Object} Object containing the signed token and basic user info
 */
export async function authenticateUser(email, password, UserModel = db.User) {
  // Basic input sanitization check
  if (!email) throw { status: 400, message: "Email is required" };
  if (!password) throw { status: 400, message: "Password is required" };

  // Locate user in database
  const user = await UserModel.findOne({ where: { email } });
  // If no user is fount, throw an error
  if (!user) throw { status: 401, message: "Invalid email or password" };

  // Verify hashed password
  const passwordsMatch = await bcrypt.compare(password, user.password);
  // If the password is invalid, throw an error
  if (!passwordsMatch)
    throw { status: 401, message: "Invalid email or password" };

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h", // Token expires in 60 minutes
    },
  );

  // Return token and safe user information to the controller
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
    },
  };
}

/**
 * Register a new user after validating their input and hashing their password.
 * * @param {Object} userData - The registration data object.
 * @param {string} userData.firstName - User's first name.
 * @param {string} userData.lastName - User's last name.
 * @param {number} userData.age - User's age.
 * @param {string} userData.email - User's email.
 * @param {string} userData.password - User's password.
 * @param {string} userData.confirmPassword - Password confirmation for validation.
 * @param {Object} [UserModel=db.User] - The Sequelize model used for database queries.
 * @returns {Promise<Object>} The newly created Sequelize user instance.
 * @throws {Object} 400 for validation errors, 409 if email is already registered.
 */
export async function registerUser(
  { firstName, lastName, age, email, password, confirmPassword },
  UserModel = db.User,
) {
  // Perform data validation (length, character types, etc.)
  const { valid, message } = validateRegistrationData({
    firstName,
    lastName,
    age,
    email,
    password,
    confirmPassword,
  });

  if (!valid) throw { status: 400, message };

  // Ensure unique constraint is respected before saving in the database
  const emailUsed = await UserModel.findOne({ where: { email } });
  if (emailUsed)
    throw {
      status: 409,
      message: "The email is already in use by another user.",
    };

  // Hash the password before saving it in the database
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Save the new user record
  const user = await UserModel.create({
    firstName,
    lastName,
    age,
    email,
    password: hashedPassword,
  });

  // Return user object to the controller
  return user;
}

/**
 * Log out a user.
 * * @description In a JWT-based system, this is primarily a placeholder or can be used
 * to handle server-side token blacklisting if implemented.
 * @returns {Promise<boolean>} Always returns true upon successful call.
 */
export async function logoutUser() {
  return true;
}

/**
 * Fetch a specific user by their unique ID, excluding sensitive information.
 * * @param {number} userId - The primary key ID of the user.
 * @param {Object} [UserModel=db.User] - The Sequelize model used for database queries.
 * @returns {Promise<Object>} The user instance with the password field omitted.
 * @throws {Object} 400 for invalid ID format, 404 if user does not exist.
 */
export async function getUserById(userId, UserModel = db.User) {
  if (!userId || typeof userId !== "number") {
    const error = new Error("Invalid user ID");
    error.status = 400;
    throw error;
  }

  const user = await UserModel.findByPk(userId, {
    // Crucial: Ensure the hashed password never leaves the service layer here
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // Return user object to the controller
  return user;
}

/**
 * Update a user's email or password after validating the new data.
 * * @param {number} userId - The ID of the user to update.
 * @param {Object} updates - Object containing the fields to update.
 * @param {string} [updates.newEmail] - The new email address to set.
 * @param {string} [updates.newPassword] - The new password to set.
 * @param {Object} [UserModel=db.User] - The Sequelize model used for database queries.
 * @returns {Promise<Object>} The updated Sequelize user instance.
 * @throws {Object} 400 for invalid formats, 404 if user not found, 409 if email is taken.
 */
export async function editUserData(
  userId,
  { newEmail, newPassword },
  UserModel = db.User,
) {
  // Get the user from the database using ihis ID
  const user = await UserModel.findByPk(userId);
  // If no user is found, throw an error
  if (!user) throw { status: 404, message: "User not found" };

  // If the there is no new data (email and password) provided, throw an error
  if (!newEmail && !newPassword)
    throw { status: 400, message: "Please provide new email or password" };

  // Handle email update logic if new email is provided
  if (newEmail) {
    // Check if the new email is valid using regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))
      throw { status: 400, message: "Invalid email format" };

    // Check if the new email is already taken by someone else
    const existingUser = await UserModel.findOne({
      where: { email: newEmail },
    });

    // If the email is taken by someone else, throw an error
    if (existingUser && existingUser.id !== userId)
      throw { status: 409, message: "Email is already in use." };

    user.email = newEmail;
  }

  // Handle password update logic if new password is provided
  if (newPassword) {
    // Check if the new password is in the valid format using regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    // If the new password is not valid, throw an error
    if (!passwordRegex.test(newPassword))
      throw {
        status: 400,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      };

    // Hash the passworad before saving it in the database
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    // Save the hashed password in the database
    user.password = hashedPassword;
  }

  // Persist changes to the database
  await user.save();
  // Return user object to the controller
  return user;
}

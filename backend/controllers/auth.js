import * as authService from "../services/authService.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Handles user login: authenticates credentials and sets an HTTP-only JWT cookie.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} 200 with user data, or error status.
 */
export async function login(req, res) {
  try {
    // Retrieve the user's information from the body
    const { email, password } = req.body;
    // Authenticate the user in the system
    const { token, user } = await authService.authenticateUser(email, password);

    // Set the JWT in a cookie.
    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true only in production (HTTPS)
      sameSite: "lax",
      maxAge: 3600000, // 1 hour
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: user,
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

/**
 * Handles new user registration.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} 201 Created on success.
 */
export async function register(req, res) {
  try {
    // Retrieve the user data from the body
    const { firstName, lastName, age, email, password, confirmPassword } =
      req.body;

    // Register the user in the database
    await authService.registerUser({
      firstName,
      lastName,
      age,
      email,
      password,
      confirmPassword,
    });

    // Return success response
    return res
      .status(201)
      .json({ success: true, message: "Registration successful" });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

/**
 * Logs out the user by clearing the authentication cookie.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} 200 OK after clearing cookie.
 */
export async function logout(req, res) {
  try {
    // Clear the cookie
    res.clearCookie("auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Updates details for the authenticated user.
 * * @param {Object} req - Express request object (expects req.userId from auth middleware).
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} 200 OK on success.
 */
export async function editUser(req, res) {
  try {
    // Retrieve the user id from the request (returned by middleware that checks if the user is authenticated in the system)
    const userId = req.userId;

    // Edit the user data
    await authService.editUserData(userId, req.body);

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "User data updated successfully" });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

/**
 * Fetches data for the currently logged-in user.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} 200 with user data or 401/500 on failure.
 */
export async function getUserData(req, res) {
  try {
    // Retrieve the user id from the request (returned by middleware that checks if the user is authenticated in the system)
    const userId = req.userId;
    // Get the user information by his ID.
    const user = await authService.getUserById(userId);

    // Return success response
    return res
      .status(200)
      .json({ success: true, authenticated: true, data: user });
  } catch (err) {
    const status = err.status || 500;
    const authFailed = status === 401;

    return res.status(status).json({
      success: !authFailed,
      authenticated: !authFailed,
      message: err.message,
      data: null,
    });
  }
}

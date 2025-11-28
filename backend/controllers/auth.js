import db from "../models/index.js";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import validateRegistrationData from "../utils/validation/validateRegistrationData.js";
import getUserIdByToken from "../utils/auth/getUserIdFromToken.js";

// Import User model from the database
const User = db.User;

/**
 * Authenticates a user by verifying their email and password.
 * If credentials are valid, generates a JWT token and stores it
 * inside an HTTP-only cookie. Returns user data on success.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response: success or error message.
 */
export async function authenticateUser(req, res) {
  try {
    // Get user email and password from request body
    const { email, password } = req.body;

    // If email is not provided, return 400 Bad Request. The function execution stops here.
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // If password is not provided, return 400 Bad Request. The function execution stops here.
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Find user by email in the database
    const user = await User.findOne({ where: { email } });

    // If user is not found, return 401 Unauthorized. The function execution stops here.
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare provided password with hashed password in the database
    const passwordsMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return 401 Unauthorized. The function execution stops here.
    if (!passwordsMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token for authenticated user
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store JWT token in HTTP-only cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000,
    });

    // Return 200 OK.
    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: { id: user.id, email: user.email, firstName: user.firstName },
    });
  } catch (err) {
    // Handle unexpected server errors
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
}


/**
 * Registers a new user by validating input data, hashing their password,
 * and creating a new record in the database.
 *
 * @function registerUser
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Incoming registration data.
 * @param {string} req.body.firstName - User's first name.
 * @param {string} req.body.lastName - User's last name.
 * @param {number|string} req.body.age - User's age.
 * @param {string} req.body.email - User's email address.
 * @param {string} req.body.password - User's password.
 * @param {string} req.body.confirmPassword - Confirmation of the user's password.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with success state, message, or error.
 */
export async function registerUser(req, res) {
    // Get the user data from the registration form
    const {firstName, lastName, age, email, password, confirmPassword} = req.body;
    const registrationData = {
        firstName, lastName, age, email, password, confirmPassword
    }

    // Call a function that handles the validation of user data from the registration form.
    const {valid: validRegistrationData, message} = validateRegistrationData(registrationData);
    // If the user data is invalid, return 400 Bad Request. The function execution stops here.
    if (!validRegistrationData)
    {
        return res.status(400).json({ success:false, message });
    }

    // Hash the password using bcrypt
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try
    {
        // Create new user in the database.
        await User.create({
          firstName,
          lastName,
          age,
          email,
          password: hashedPassword,
        })
        
        // If registration is successful, return 201 Created.
        return res.status(201).json({ success:true, message: 'Registration successful' });
    }
    catch (err)
    {
        // Handle duplicate values error.
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists. Please use a different one.'
            });
        }

        // Handle bad field value error
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: err.errors[0].message || 'Validation failed'
            });
        }

        // Catch everything else
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


/**
 * Logs out the user by clearing the authentication cookie.
 *
 * @function logout
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response confirming logout success or an error.
 */
export async function logout(req, res) {
  try {
    // Clear the authentication cookie
    res.clearCookie("auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Return 200 OK.
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    // Handle unexpected errors.
    console.error("Error during logout:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


/**
 * Updates the authenticated user's email and/or password in the database.
 *
 * This function:
 * - Extracts the user ID from the authentication token stored in cookies.
 * - Verifies that the user exists in the database.
 * - Validates and updates the user's email and/or password if provided.
 * - Returns an appropriate HTTP response based on the operation outcome.
 *
 * @async
 * @function editUserData
 * @param {import('express').Request} req - Express request object.
 *   @property {Object} req.cookies - Cookies from the incoming request.
 *   @property {Object} req.body - Request body containing `newEmail` and/or `newPassword`.
 * @param {import('express').Response} res - Express response object used to send HTTP responses.
 *
 * @returns {Promise<void>} Sends a JSON response with one of the following outcomes:
 * 
 * - **200 OK** – `{ success: true, message: "User data updated successfully" }`
 *    User's email and/or password successfully updated.
 * 
 * - **400 Bad Request** – 
 *   - `{ success: false, message: "Please provide new email or password" }` if no data provided.
 *   - `{ success: false, message: "Invalid email format" }` if email format is invalid.
 *   - `{ success: false, message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." }` if password does not meet criteria.
 *
 * - **401 Unauthorized** – 
 *   - `{ success: false, message: "Invalid or expired token" }` if JWT is invalid or expired.
 *   - `{ success: false, message: "Unauthorized" }` if token is missing or invalid (handled in token extraction).
 * 
 * - **404 Not Found** – `{ success: false, message: "User not found" }` if the user ID does not exist in the database.
 * 
 * - **409 Conflict** – `{ success: false, message: "Email is already in use." }` if another user already has the requested email.
 * 
 * - **500 Internal Server Error** – `{ success: false, message: "Internal server error" }` if an unexpected error occurs.
 *
 * @throws {JsonWebTokenError|TokenExpiredError} When the JWT is invalid or expired.
 */
export async function editUserData(req, res) {
  try 
  {
    // Call a function that extracts the user ID from the auth cookie token.
    const {success, status, message, userId} = getUserIdByToken(req.cookies, 'auth-token');
    // If the id can not be extracted from the token, the function execution stops here.
    if (!success)
    {
        return res.status(status).json({success:false, message });
    }

    // Get the user data from the database using the user's ID. 
    const user = await User.findOne({ where: { id: userId } });
    // If user data is not found in the database, return 404 Not Found. The function execution stops here.
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get the updated user data from the request
    const { newEmail, newPassword } = req.body;

    // If no data is provided, return 400 Bad Request. The function execution stops here.
    if(!newEmail && !newPassword)
    {
        return res.status(400).json({success:false, message:"Please provide new email or password"});
    }

    // Update email if provided
    if (newEmail) {
      // If the provided email is invalid, return 400 Bad Request. The function execution stops here.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }

      // Check if there is a user that is already using the email.
      const existingUser = await User.findOne({ where: { email: newEmail } });
      // If another user is already using the email, return 409 Conflict. The function execution stops here.
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Email is already in use." });
      }

      // If valid and available, update the email
      user.email = newEmail;
    }

    // Update password if provided
    if (newPassword) {
      // Check for password validity.
      // The password must be at least 8 chars and include uppercase, lowercase, number, and special character.
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      // If the password is invalid, return 400 Bad Request. The function execution stops here.
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({success: false,message:"Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."});
      }

      // Hash the new password before saving.
      const saltRounds = parseInt(process.env.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
    }

    // Save the user's record in the database with the updated data
    await user.save();

    // Send 200 OK response.
    return res.status(200).json({ success: true, message: "User data updated successfully" });
  } catch (err) {

    // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}


/**
 * Deletes the authenticated user's account.
 *
 * This controller handles the `DELETE /auth` endpoint. It verifies the JWT from the user's cookies,
 * deletes the corresponding user record from the database, and clears the authentication cookie.
 *
 * @async
 * @function deleteUser
 * @param {import('express').Request} req - The Express request object.  
 * Must contain a valid JWT in the cookie named `'auth-token'`.
 * @param {import('express').Response} res - The Express response object used to return the operation result.
 * @returns {Promise<import('express').Response>} A JSON response with the result of the operation:
 *
 * | Status | success | message |
 * |:-------|:---------|:--------|
 * | **200 OK** | `true` | `"User account deleted successfully"` |
 * | **401 Unauthorized** | `false` | `"Unauthorized"` or `"Invalid or expired token"` |
 * | **404 Not Found** | `false` | `"User not found"` |
 * | **500 Internal Server Error** | `false` | `"Internal server error"` |
 *
 * @throws {JsonWebTokenError} If the token is malformed or invalid.
 * @throws {TokenExpiredError} If the token has expired.
 *
 * @example
 * // Example request
 * DELETE /auth
 * Cookie: auth-token=<JWT>
 *
 * // Example successful response
 * {
 *   "success": true,
 *   "message": "User account deleted successfully"
 * }
 *
 * // Example unauthorized response
 * {
 *   "success": false,
 *   "message": "Unauthorized"
 * }
 */
export async function deleteUser(req, res) {
    try {
        const token = req.cookies["auth-token"];
        if (!token) 
        {
          return res.status(401).json({
            success: false,
            message: "Unauthorized",
          });
        }

        let decoded;
        try 
        {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } 
        catch (err) 
        {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
          });
        }

        // Check if user exists
        const user = await db.User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete the user
        await user.destroy();

        return res.status(200).json({
            success: true,
            message: "User account deleted successfully",
        });
    } 
    catch (error) 
    {
      return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


/**
 * Controller for verifying whether a user is currently authenticated.
 *
 * This endpoint is called via **GET /auth** and checks the presence and validity
 * of a JWT stored in the user's cookies (`auth-token`).  
 * If the token is valid, it confirms the user's authentication status.
 *
 * @async
 * @function checkIfUserIsLoggedIn
 * @param {import('express').Request} req - The Express request object, containing cookies with the JWT.
 * @param {import('express').Response} res - The Express response object, used to send back the authentication status.
 * @returns {Promise<import('express').Response>} Returns an HTTP response with:
 *  - **200 OK** if the user is authenticated.  
 *  - **401 Unauthorized** if the token is missing, invalid, or expired.  
 *  - **500 Internal Server Error** for unexpected issues during verification.
 *
 * @example
 * // Example request:
 * // GET /auth
 * // Cookie: auth-token=<JWT>
 *
 * // Successful response:
 * {
 *   "success": true,
 *   "message": "User is authenticated"
 * }
 *
 * // Unauthenticated response:
 * {
 *   "success": false,
 *   "message": "Unauthorized"
 * }
 *  
 * // Invalid or expired token response:
 * {
 *   "success": false,
 *   "message": "Invalid or expired token"
 * }
 */
export async function checkIfUserIsLoggedIn(req, res) {
    // Extract token from cookies
    const token = req.cookies['auth-token'];

    // If no token, return 401 Unauthorized. The function execution stops here.
    if (!token) 
    {
        // If no token, user is not logged in
        return res.status(200).json({ success: false, message: "Unauthorized" });
    }

    try 
    {
        // Verify the token with the secret key
        jwt.verify(token, process.env.JWT_SECRET);

        // If the token is valid, return 200 OK and decoded user info.
        return res.status(200).json({ success: true, message: "User is authenticated" });
    } 
    catch (error) 
    {
        // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
        {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}



export async function getAllUsers(req, res)
{
    const allUsers = await User.findAll();
    return res.status(200).json(allUsers);
}
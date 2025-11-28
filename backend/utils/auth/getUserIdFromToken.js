import jwt from 'jsonwebtoken';

/**
 * Extracts and verifies a user's ID from a JWT stored in cookies.
 *
 * This function reads a JWT token from the specified cookie name, verifies it and returns 
 * the decoded user ID if valid. It handles missing, invalid, or expired tokens and unexpected 
 * errors and returns an object describing the result.
 *
 * @function getUserIdFromToken
 * @param {Object} cookies - An object containing cookies from `req.cookies`.
 * @param {string} tokenName - The name of the cookie containing the JWT.
 * @returns {{
 *   success: boolean,
 *   status: number,
 *   message: string,
 *   userId?: number
 * }} An object describing the verification result:
 *
 * | status | success | message | userId |
 * |:--------|:---------|:------------------------------|:--------|
 * | **200 OK** | `true` | `"User ID found"` | `<number>` |
 * | **401 Unauthorized** | `false` | `"Unauthorized"` or `"Invalid or expired token"` | *undefined* |
 * | **404 Not Found** | `false` | `"User ID not found in the token"` | *undefined* |
 * | **500 Internal Server Error** | `false` | `"Token processing error"` | *undefined* |
 *
 * @throws {JsonWebTokenError} If the JWT is invalid.
 * @throws {TokenExpiredError} If the JWT has expired.
 *
 * @example
 * // Example usage:
 * import getUserIdFromToken from './authUtils.js';
 *
 * const result = getUserIdFromToken(req.cookies, 'auth-token');
 *
 * if (result.success) {
 *   console.log(result.userId); // 42
 * } else {
 *   console.error(result.message);
 * }
 */
export default function getUserIdFromToken(cookies, tokenName) {
  try {
    // Extract token from cookies
    const token = cookies[tokenName];
    if (!token) {
      return { success: false, status: 401, message: 'Unauthorized' };
    }

    // Decode and verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Ensure token contains a valid user ID
    if (!userId) {
      return { success: false, status: 404, message: 'User ID not found in the token' };
    }

    // Successful extraction
    return { success: true, status: 200, message: 'User ID found', userId };
  } catch (err) {
    // Handle token-related errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return { success: false, status: 401, message: 'Invalid or expired token' };
    }

    // Handle unexpected failures
    return { success: false, status: 500, message: err.message };
  }
}

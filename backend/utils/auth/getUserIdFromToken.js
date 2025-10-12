import jwt from 'jsonwebtoken';

export default function getUserIdFromToken(cookies, tokenName) {
  try {
    // Extract token from cookies
    const token = cookies[tokenName];
    // If no token, the function execution stops here.
    if (!token) {
      return { success: false, status: 401, message: "Unauthorized" };
    }

    // Decode the token and extract user id from it.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // If no user ID found in the token, the function execution stops here.
    if (!userId) {
      return { success: false, status: 404, message: "User ID not found in the token" };
    }

    // Return an object containing information about the success of the function and the user ID.
    return { success: true, status: 200, message: "User ID found", userId };
  } 
  catch (err) {

    // If the token is invalid or expired, the function execution stops here.
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return { success: false, status: 401, message: "Invalid or expired token" };
    }

    // Handle unexpected errors.
    return { success: false, status: 500, message: "Token processing error" };
  }
}

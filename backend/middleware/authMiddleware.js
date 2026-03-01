import jwt from "jsonwebtoken";

/**
 * Express middleware to authenticate a user via JWT stored in cookies.
 *
 * - Verifies the token.
 * - Attaches `req.userId` if valid.
 * - Returns proper HTTP errors if invalid, missing, or expired.
 *
 * @param {string} tokenName - Name of the cookie containing the JWT (default: 'auth-token').
 */
export default function authMiddleware(req, res, next) {
  try {
    const token = req.cookies["auth-token"];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res
        .status(404)
        .json({ message: "User ID not found in the token" });
    }

    // Attach userId to the request object for downstream handlers
    req.userId = userId;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Token processing error" });
  }
}

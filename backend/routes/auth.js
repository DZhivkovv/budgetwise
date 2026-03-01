import express from "express";
const router = express.Router();

import {
  login,
  register,
  getUserData,
  editUser,
  logout,
} from "../controllers/auth.js";
import authMiddleware from "../middleware/authMiddleware.js";

// Register: route handles POST requests to /auth/register
router.post("/register", register);
// Login: route handles POST requests to /auth/login
router.post("/login", login);
// Logout: route handles GET requests to /auth/logout
router.get("/logout", authMiddleware, logout);
// Edit user data: route handles PATCH requests to /auth
router.patch("/", authMiddleware, editUser);
// Get authenticated user data: route handles GET requests to /auth/me
router.get("/me", authMiddleware, getUserData);

export default router;

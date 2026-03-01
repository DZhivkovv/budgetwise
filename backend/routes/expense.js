import {
  getAllUserExpenses,
  addUserExpense,
  editUserExpense,
  deleteUserExpense,
} from "../controllers/expense.js";
import authMiddleware from "../middleware/authMiddleware.js";

import express from "express";
const router = express.Router();

// Get all user expenses route: handles GET requests to /expense/expenses
router.get("/expenses", authMiddleware, getAllUserExpenses);
// Add user expense route: handles POST requests to /expense
router.post("/", authMiddleware, addUserExpense);
// Edit user expense route: handles PATCH requests to /expense
router.patch("/", authMiddleware, editUserExpense);
// Delete user expense route: handles DELETE requests to /expense/:id
router.delete("/:id", authMiddleware, deleteUserExpense);

export default router;

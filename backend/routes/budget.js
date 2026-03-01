import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { closeExpiredBudgets } from "../middleware/closeExpiredBudgets.js";
import {
  checkForActiveBudget,
  addUserBudget,
  editUserBudget,
  getAllUserBudgets,
} from "../controllers/budget.js";

const router = express.Router();

// Group auth and closing expired budgets middlewares.
const authAndCloseExpiredBudgets = [authMiddleware, closeExpiredBudgets];

// Get active budget (with auth + closing expired budgets)
router.get("/", authAndCloseExpiredBudgets, checkForActiveBudget);
// Get all user budgets (with auth + closing expired budgets)
router.get("/all", authAndCloseExpiredBudgets, getAllUserBudgets);
// Add a new budget (only auth required)
router.post("/", authMiddleware, addUserBudget);
// Edit an existing budget (only auth required)
router.patch("/", authMiddleware, editUserBudget);

export default router;

import {
  addUserGoal,
  deleteUserGoal,
  editUserGoal,
  getActiveUserGoals,
} from "../controllers/goal.js";
import authMiddleware from "../middleware/authMiddleware.js";

import express from "express";
const router = express.Router();

// Get all active user goals: route handles GET requests to /goal
router.get("/goals", authMiddleware, getActiveUserGoals);
// Add a goal: route handles POST requests to /goal
router.post("/", authMiddleware, addUserGoal);
// Edit a goal: route handles PUT requests to /goal
router.put("/", authMiddleware, editUserGoal);
// Delete a goal: route handles DELETE requests to /goal/:id
router.delete("/:id", authMiddleware, deleteUserGoal);

export default router;

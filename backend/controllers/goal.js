import * as goalService from "../services/goalsService.js";
import validateGoalInput from "../utils/validation/validateGoalInput.js";

/**
 * Controller: Retrieve all active goals for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {number} req.userId - Injected by auth middleware.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with an array of goals.
 */
export async function getActiveUserGoals(req, res) {
  try {
    // Get the user ID from the request
    const userId = req.userId;
    // Call a service function to retrieve all active goals for the authenticated user
    const goals = await goalService.getActiveGoals(userId);
    // Return success response
    return res.status(200).json({ success: true, goals });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Controller: Add a new saving or spending goal for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Contains targetAmount, type, deadline, and categoryId.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 201 Created on success, or 400/401/500 on failure.
 */
export async function addUserGoal(req, res) {
  try {
    // Get the user ID and goal data from the request
    const userId = req.userId;
    const { targetAmount, type, deadline, categoryId } = req.body;

    // Initialize new goals at zero progress
    const currentAmount = 0;
    const status = "active";

    // Validate the input against business rules
    const { valid, message } = await validateGoalInput(
      targetAmount,
      type,
      status,
      deadline,
      categoryId,
    );

    // If the user goal data is invalid, throw an error
    if (!valid) {
      return res.status(400).json({ success: false, message });
    }

    // Call a service function to create active user goal
    const goal = await goalService.createGoal(userId, {
      targetAmount,
      currentAmount,
      type,
      deadline,
      categoryId,
    });

    // Return success response
    return res
      .status(201)
      .json({ success: true, message: "Goal added successfully!", goal });
  } catch (error) {
    // Error handling

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token." });
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Controller: Update an existing goal's parameters or status.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Updated goal data including goalId.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 Updated, 404 Not Found, or 409 Conflict.
 */
export async function editUserGoal(req, res) {
  try {
    // Get the user ID and goal data from the request
    const userId = req.userId;
    const { goalId, targetAmount, deadline, categoryId, type, status } =
      req.body;

    // Validate update data
    const { valid, message } = validateGoalInput(
      targetAmount,
      type,
      status,
      deadline,
    );

    // If the data is invalid, throw an error
    if (!valid) {
      return res.status(400).json({ success: false, message });
    }

    // Call a service function to update the goal
    const updatedGoal = await goalService.updateGoal(userId, {
      id: goalId,
      targetAmount,
      deadline,
      categoryId,
      type,
      status,
    });

    // If the update is not successful, return a response with this information
    if (!updatedGoal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found." });
    }

    // If the update is successful, return a success response
    return res.status(200).json({
      success: true,
      message: "Goal updated successfully!",
      goal: updatedGoal,
    });
  } catch (error) {
    // Error handling
    if (error.message === "ACTIVE_GOAL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "There is already an active goal for this category.",
      });
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Controller: Delete a saving/ spending goal of the authenticated user.
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - The ID of the goal to delete.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 OK or 404 Not Found.
 */
export async function deleteUserGoal(req, res) {
  try {
    // Get the user ID and goal ID from the request
    const userId = req.userId;
    const { id } = req.params; // ID of the goal to be deleted

    // Call a service layer function to delete a goal
    const deletedGoal = await goalService.deleteGoal(userId, { id });
    // If the deletion is not successful, return response with that information to the user
    if (!deletedGoal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found." });
    }

    // If the deletion is successful, return a success response
    return res
      .status(200)
      .json({ success: true, message: "Goal deleted successfully!" });
  } catch (error) {
    // Error handling
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token." });
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

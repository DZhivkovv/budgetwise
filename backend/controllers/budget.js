import * as budgetService from "../services/budgetService.js";

/**
 * Controller: Retrieve the currently active budget for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {number} req.userId - Extracted from the auth middleware.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with budget details, or 404 if no active budget exists.
 */
export async function checkForActiveBudget(req, res) {
  try {
    // Retrieve the user ID from the request
    const userId = req.userId;

    // Call a service layer function to get the active user budget
    const activeBudget = await budgetService.getActiveBudget(userId);
    // If no active user budget is found return a response and prompt the user to create one
    if (!activeBudget)
      return res
        .status(404)
        .json({ success: false, message: "Please, add a budget" });

    // If active budget is found, return success response
    return res.status(200).json({
      success: true,
      budget: activeBudget.budget,
      remainingBudget: activeBudget.remainingBudget,
      currency: activeBudget.currency,
      startDate: activeBudget.startDate,
      endDate: activeBudget.endDate,
    });
  } catch (error) {
    // Catch JWT-specific errors that might bypass middleware or occur during processing
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
      .json({ success: false, message: "Internal server error." });
  }
}

/**
 * Controller: Retrieve all budgets associated with the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with full budget history list.
 */
export async function getAllUserBudgets(req, res) {
  try {
    // Retrieve user ID from request
    const userId = req.userId;
    // Get all user budgets
    const allBudgets = await budgetService.getAllBudgets(userId);

    // Return success response.
    return res.status(200).json({
      success: true,
      hasBudgets: allBudgets.length > 0,
      allBudgets,
    });
  } catch (error) {
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
      .json({ success: false, message: "Internal server error." });
  }
}

/**
 * Controller: Create a new budget period for the user.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Contains the budget amount ('budget').
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 201 Created on success.
 */
export async function addUserBudget(req, res) {
  try {
    //Retrieve user ID and budget data from request
    const userId = req.userId;
    const { budget } = req.body;

    // Create user budget
    await budgetService.createBudget(userId, budget);

    // Return success response
    return res
      .status(201)
      .json({ success: true, message: "Budget added successfully!" });
  } catch (error) {
    if (error.status)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });

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
 * Controller: Update the current active budget's total amount and currency.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Contains 'budget' (amount) and 'currency'.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with updated budget values.
 */
export async function editUserBudget(req, res) {
  try {
    // Retrieve user ID and budget data from request
    const userId = req.userId;
    const { budget, currency } = req.body;

    // Update and recalculate remaining balance
    const updatedBudget = await budgetService.updateBudget(
      userId,
      budget,
      currency,
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Budget edited successfully.",
      budget: updatedBudget.budget,
      remainingBudget: updatedBudget.remainingBudget,
    });
  } catch (error) {
    if (error.status)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    )
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token." });

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

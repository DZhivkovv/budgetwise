import * as expenseService from "../services/expenseService.js";

/**
 * Controller: Retrieve all expenses for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {number} req.userId - Extracted from auth middleware.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with an array of expense objects.
 */
export async function getAllUserExpenses(req, res) {
  try {
    // Get the user ID from the request
    const userId = req.userId;
    // Expense filters
    const filters = req.query;
    // User expenses
    let expenses;

    // If there are no filters applied, fetch all expenses that belong to the authenticated user.
    if (Object.keys(filters).length === 0) {
      // No expense filters are applied.

      // Call a service layer function to fetch all user expenses
      expenses = await expenseService.fetchAllUserExpenses(userId);
    } else {
      // Expense filters are applied.
      // Call a service layer fuction to fetch the filtered user expenses.
      expenses = await expenseService.filterExpenses(userId, filters);
    }

    // Return success response
    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error(error);
    // Error handling for unexpected database or server issues
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Controller: Create a new expense record and update the user's remaining budget.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Expense details (amount, categoryId, date, description).
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with the created expense and updated budget status.
 */
export async function addUserExpense(req, res) {
  try {
    // Get the user ID from the request
    const userId = req.userId;
    // Call service layer function to create user expense record
    const result = await expenseService.createUserExpense(userId, req.body);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "User expense added successfully!",
      ...result,
    });
  } catch (error) {
    // Handle business logic errors (e.g., 404 Category Not Found or 400 Validation)
    if (error.status)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });

    // Security fallback for token issues
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    )
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token." });

    // Response in case of unexpected server errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Controller: Update an existing expense and adjust the associated budget accordingly.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Updated expense data including the expense ID.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with updated expense data.
 */
export async function editUserExpense(req, res) {
  try {
    // Get the user Id from the request
    const userId = req.userId;
    // Call service layer function to update user expense
    const result = await expenseService.updateUserExpense(userId, req.body);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Expense updated successfully!",
      ...result,
    });
  } catch (error) {
    // Error handling
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

/**
 * Controller: Remove an expense and add the amount of the deleted expense to the user's budget.
 * @param {Object} req - Express request object.
 * @param {Object} req.params.id - The ID of the expense to delete.
 * @param {Object} res - Express response object.
 * @returns {Promise<Response>} 200 with the recalculated budget information.
 */
export async function deleteUserExpense(req, res) {
  try {
    // Get the user ID from the request
    const userId = req.userId;
    // Get the expense ID
    const expenseId = Number(req.params.id);

    // Call a service layer function to delete the expense and recalculate the user budget
    const budget = await expenseService.deleteUserExpense(userId, expenseId);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
      budget,
    });
  } catch (error) {
    // Error handling
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

import db from "../../models/index.js";
const Budget = db.Budget;

/**
 * Retrieves the budget of a specific user from the database by their user ID.
 *
 * @async
 * @function getUserBudget
 * @param {number} userId - The unique ID of the authenticated user in the database.
 * @returns {Promise<{ success: boolean, status: number, message: string, data: object }>}
 * Returns a promise that resolves to an object containing:
 *  - `success` {boolean} — Indicates if the operation succeeded.
 *  - `status` {number} — HTTP-like status code (200 for success, 400 for invalid input,
 *                        404 if not found, 500 on error).
 *  - `message` {string} — A descriptive message about the operation result.
 *  - `data` {object} — The user's budget record if found; empty object otherwise.
 *
 * @throws {Error} Throws an error if a database or internal issue occurs during execution.
 *
 * @example
 * // Example usage inside a controller:
 * const { success, status, message, data: budget } = await getUserBudget(5);
 * if (!success) return res.status(status).json({ success, message });
 * console.log(budget.remainingBudget);
 */
export default async function getUserBudget(userId, BudgetModel) {
  try {
    // Validate the userId before querying the database
    // If the ID is not a valid number, the function execution stops here.
    if (
      userId === undefined ||
      userId === null ||
      isNaN(userId) ||
      Number(userId) <= 0
    ) {
      return {
        success: false,
        status: 400,
        message: "Invalid or missing user ID.",
        data: {},
      };
    }

    // Find if the user has a budget record in the database.
    const budget = await BudgetModel.findOne({ where: { userId } });

    // If the user does not have a budget, the function execution stops here.
    if (!budget) {
      return {
        success: false,
        status: 404,
        message: "No budget found.",
        data: {},
      };
    }

    // Return the user's budget.
    return {
      success: true,
      status: 200,
      message: "User budget retrieved successfully!",
      data: budget,
    };
  } catch (error) {
    return { success: false, status: 500, message: error.message, data: {} };
  }
}

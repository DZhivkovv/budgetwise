import { Op } from "sequelize";
import db from "../models/index.js";

/**
 * Middleware to automatically close budgets that have reached their end date.
 * * This function checks for any 'active' budgets where the `endDate` is
 * less than or equal to the current date and marks them as `isClosed: true`.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @param {Object} [BudgetModel=db.Budget] - Injected Sequelize model (defaults to db.Budget for easier testing).
 */
export async function closeExpiredBudgets(
  req,
  res,
  next,
  BudgetModel = db.Budget,
) {
  try {
    // Standardize today's date to YYYY-MM-DD to match database date strings
    const todayStr = new Date().toISOString().split("T")[0];

    // Batch update all budgets that are past their deadline
    await BudgetModel.update(
      { isClosed: true },
      {
        where: {
          isClosed: false, // Only target budgets currently marked as active
          endDate: { [Op.lte]: todayStr }, // Check if end date is today or in the past
        },
      },
    );

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    // Log the error but call next() so the user's request isn't blocked by background cleanup failure
    console.error("Error closing expired budgets:", error);
    next();
  }
}

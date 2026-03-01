import { Op } from "sequelize";
import db from "../models/index.js";
import { getBudgetEndDate } from "../utils/budget/getBudgetEndDate.js";
import { validateUserBudget } from "../utils/validation/validateUserBudget.js";

/**
 * Retrieve the active budget for a user.
 * * @param {number} userId - The user ID.
 * @param {Object} [BudgetModel=db.Budget] - Sequelize model for Budget.
 * @returns {Promise<Object|null>} The active budget data or null if none found.
 */
export async function getActiveBudget(userId, BudgetModel = db.Budget) {
  // Get and format today's date to ensure accurate comparison with DB dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the user's active budget
  const activeBudget = await BudgetModel.findOne({
    where: {
      userId,
      startDate: { [Op.lte]: today }, // Start date is today or in the past
      endDate: { [Op.gte]: today }, // End date is today or in the future
      isClosed: false, // Budget has not been manually or automatically closed
    },
  });

  // Return the user's active budget
  return activeBudget;
}

/**
 * Retrieve the full budget history for a specific user.
 * * @param {number} userId - The unique identifier of the user.
 * @param {Object} [BudgetModel=db.Budget] - Sequelize model for Budget.
 * @returns {Promise<Array>} List of all budget records for the user.
 * @throws {Object} 401 if userId is missing.
 */
export async function getAllBudgets(userId, BudgetModel = db.Budget) {
  // Get user's every budgets
  const allUserBudgets = await BudgetModel.findAll({ where: { userId } });
  // Return every user budget
  return allUserBudgets;
}

/**
 * Create a new budget for a user after validating input and checking for date overlaps.
 * * @param {number} userId - The unique identifier of the user.
 * @param {number|string} budgetAmount - The total amount allocated for the budget.
 * @param {Object} [BudgetModel=db.Budget] - Sequelize model for Budget.
 * @returns {Promise<Object>} The created budget instance.
 * @throws {Object} 400/409 for validation errors or overlapping budget periods.
 */
export async function createBudget(
  userId,
  budgetAmount,
  BudgetModel = db.Budget,
) {
  const currency = "EUR"; // Default currency
  const parsedBudget = parseFloat(budgetAmount);

  // Validate the budget and currency data
  const validation = validateUserBudget(parsedBudget, currency);
  // If the data is invalid, throw an error
  if (!validation.valid) {
    throw { status: validation.status, message: validation.message };
  }

  // Get the start date of the budget and calculate the end date
  const startDate = new Date();
  const endDate = getBudgetEndDate(startDate);

  // Check if an active user budget overlaps with the new budget's timeframe
  const overlappingBudget = await BudgetModel.findOne({
    where: {
      userId,
      isClosed: false,
      [Op.or]: [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } },
        {
          startDate: { [Op.lte]: startDate },
          endDate: { [Op.gte]: endDate },
        },
      ],
    },
  });

  // If an active user budget overlaps with the new budget's timeframe, throw an error
  if (overlappingBudget) {
    throw {
      status: 409,
      message: "An active budget already exists for this period",
    };
  }

  // Create user budget
  const budget = await BudgetModel.create({
    userId,
    startDate,
    endDate,
    budget: parsedBudget,
    remainingBudget: parsedBudget,
    currency,
  });

  // Return budget data to the controller
  return budget;
}

/**
 * Update the current active budget and recalculate the remaining balance based on expenses.
 * * @param {number} userId - The unique identifier of the user.
 * @param {number|string} budgetAmount - The new total budget amount.
 * @param {string} currency - The currency type (e.g., 'EUR', 'USD').
 * @param {Object} [BudgetModel=db.Budget] - Sequelize model for Budget.
 * @param {Object} [ExpenseModel=db.Expense] - Sequelize model for Expenses.
 * @returns {Promise<Object>} The updated budget instance.
 * @throws {Object} 400/404 for validation or missing active budget.
 */
export async function updateBudget(
  userId,
  budgetAmount,
  currency,
  BudgetModel = db.Budget,
  ExpenseModel = db.Expense,
) {
  const parsedBudget = parseFloat(budgetAmount);
  // Validate budget data
  const validation = validateUserBudget(parsedBudget, currency);
  // If budget data is invalid, throw an error
  if (!validation.valid)
    throw { status: validation.status, message: validation.message };

  // Get the user's active budget
  const activeBudget = await BudgetModel.findOne({
    where: { userId, isClosed: false },
  });
  // If an active budget is not found, throw an error
  if (!activeBudget)
    throw { status: 404, message: "User does not have a budget" };

  // Update budget fields
  activeBudget.budget = parsedBudget;
  activeBudget.currency = currency;

  // Calculate all expenses that happened within the specific date range of this budget
  const spentThisPeriod = await ExpenseModel.sum("amount", {
    where: {
      userId,
      date: { [Op.between]: [activeBudget.startDate, activeBudget.endDate] },
    },
  });

  // Update the remaining budget based on the new budget minus existing spending
  activeBudget.remainingBudget = parsedBudget - (spentThisPeriod || 0);
  await activeBudget.save();

  // Return updated budget data to the controller
  return activeBudget;
}

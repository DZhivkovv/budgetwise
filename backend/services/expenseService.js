import db from "../models/index.js";
import validateExpenseInput from "../utils/validation/validateExpenseInput.js";
import getUserBudget from "../utils/budget/getUserBudget.js";
import { recalculateActiveGoalForCategory } from "./goalsService.js";

/**
 * Get all expenses for a user, including category and budget currency
 */
export async function fetchAllUserExpenses(
  userId,
  UserModel = db.User,
  ExpenseModel = db.Expense,
  BudgetModel = db.Budget,
  CategoryModel = db.Category,
) {
  const expenses = await ExpenseModel.findAll({
    where: { userId },
    include: [
      { model: CategoryModel, as: "category", attributes: ["name"] },
      {
        model: UserModel,
        as: "users",
        include: [
          { model: BudgetModel, as: "budgets", attributes: ["currency"] },
        ],
        attributes: ["id"],
      },
    ],
  });

  return expenses;
}

/**
 * Add a new expense for a user
 */
export async function createUserExpense(
  userId,
  expenseData,
  ExpenseModel = db.Expense,
  CategoryModel = db.Category,
  BudgetModel = db.Budget,
  GoalModel = db.Goal,
  sequelizeInstance = db.sequelize,
) {
  const { categoryId, amount, date, notes } = expenseData;
  const parsedAmount = Number(amount);
  // Validate input
  const { valid, message } = validateExpenseInput(
    categoryId,
    parsedAmount,
    date,
  );
  if (!valid) throw { status: 400, message };

  const category = await CategoryModel.findOne({ where: { id: categoryId } });
  if (!category) throw { status: 404, message: "Category not found." };

  const { success: budgetSuccess, data: budget } = await getUserBudget(
    userId,
    BudgetModel,
  );
  if (!budgetSuccess) throw { status: 404, message: "User budget not found." };

  const expenseDateObj = new Date(date);
  if (
    expenseDateObj < new Date(budget.startDate) ||
    expenseDateObj > new Date(budget.endDate)
  ) {
    throw {
      status: 403,
      message: "Expenses can be added only for the current budget period.",
    };
  }

  // Transaction for creating expense and updating budget
  const transaction = await sequelizeInstance.transaction();
  try {
    const budgetForUpdate = await BudgetModel.findOne({
      where: { id: budget.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const expense = await ExpenseModel.create(
      {
        userId,
        categoryId,
        amount: parsedAmount,
        date,
        notes,
      },
      { transaction },
    );

    budgetForUpdate.remainingBudget -= parsedAmount;
    await budgetForUpdate.save({ transaction });
    await transaction.commit();
    return { expense, budget: budgetForUpdate };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Edit an existing expense
 */
export async function updateUserExpense(
  userId,
  expenseData,
  ExpenseModel = db.Expense,
  CategoryModel = db.Category,
  BudgetModel = db.Budget,
  sequelizeInstance = db.sequelize,
) {
  const { id: expenseId, categoryId, amount, date, notes } = expenseData;
  if (!expenseId || isNaN(expenseId))
    throw { status: 400, message: "Expense not found." };

  const parsedAmount = Number(amount);

  // Validate input
  const { valid, message } = validateExpenseInput(
    categoryId,
    parsedAmount,
    date,
  );
  if (!valid) throw { status: 400, message };

  const category = await CategoryModel.findOne({ where: { id: categoryId } });
  if (!category) throw { status: 404, message: "Category not found." };

  const { success: budgetSuccess, data: budget } = await getUserBudget(
    userId,
    BudgetModel,
  );
  if (!budgetSuccess) throw { status: 404, message: "User budget not found." };

  const expense = await ExpenseModel.findOne({
    where: { id: expenseId, userId },
  });
  if (!expense) throw { status: 404, message: "Expense not found." };
  const oldCategoryId = expense.categoryId;
  const expenseDateObj = new Date(date);
  if (
    expenseDateObj < new Date(budget.startDate) ||
    expenseDateObj > new Date(budget.endDate)
  ) {
    throw {
      status: 403,
      message: "Expenses can be updated only for the current budget period.",
    };
  }

  const expenseDiff = parsedAmount - expense.amount;
  const updatedBudget = budget.remainingBudget - expenseDiff;
  const transaction = await sequelizeInstance.transaction();
  try {
    // Update expense
    expense.categoryId = categoryId;
    expense.amount = parsedAmount;
    expense.date = date;
    expense.notes = notes;

    // Update budget
    budget.remainingBudget = updatedBudget;

    await expense.save({ transaction });
    await budget.save({ transaction });

    // If category changed → recalc old category goal
    if (oldCategoryId !== categoryId) {
      await recalculateActiveGoalForCategory(
        userId,
        oldCategoryId,
        transaction,
      );
    }

    await transaction.commit();
    return { expense, budget };
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    throw error;
  }
}

/**
 * Delete an expense
 */
export async function deleteUserExpense(
  userId,
  expenseId,
  ExpenseModel = db.Expense,
  BudgetModel = db.Budget,
  sequelizeInstance = db.sequelize,
) {
  if (!expenseId || !Number.isInteger(expenseId))
    throw { status: 400, message: "Expense not found." };

  const expense = await ExpenseModel.findOne({
    where: { id: expenseId, userId },
  });
  if (!expense) throw { status: 404, message: "Expense not found." };

  const { success: budgetSuccess, data: budget } = await getUserBudget(
    userId,
    BudgetModel,
  );
  if (!budgetSuccess) throw { status: 404, message: "User budget not found." };

  const expenseDateObj = new Date(expense.date);
  if (
    expenseDateObj < new Date(budget.startDate) ||
    expenseDateObj > new Date(budget.endDate)
  ) {
    throw {
      status: 403,
      message: "Expenses can be deleted only for the current budget period.",
    };
  }
  const expenseCategoryId = expense.categoryId;

  const useTransaction = sequelizeInstance.getDialect() !== "sqlite";
  let transaction;
  if (useTransaction) {
    transaction = await sequelizeInstance.transaction();
  }
  try {
    budget.remainingBudget =
      Number(budget.remainingBudget) + Number(expense.amount);

    await expense.destroy(transaction ? { transaction } : undefined);
    await budget.save(transaction ? { transaction } : undefined);

    if (useTransaction) await transaction.commit();

    return budget;
  } catch (error) {
    if (useTransaction) await transaction.rollback();
    throw error;
  }
}

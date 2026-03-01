import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { Sequelize } from "sequelize";
import { sequelize } from "../../../../db/testDb.js";

import { updateBudget } from "../../../budgetService.js";

import UserModel from "../../../../models/user.model.js";
import BudgetModel from "../../../../models/budget.model.js";
import ExpenseModel from "../../../../models/expense.model.js";
import CategoryModel from "../../../../models/category.model.js";

const User = UserModel(sequelize, Sequelize);
const Budget = BudgetModel(sequelize, Sequelize);
const Expense = ExpenseModel(sequelize, Sequelize);
const Category = CategoryModel(sequelize, Sequelize);

describe("updateBudget – DB integration (SQLite)", () => {
  let user, budget;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create a test category
    await Category.create({ id: 1, name: "General" });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Disable foreign key checks temporarily
    await sequelize.query("PRAGMA foreign_keys = OFF");

    // Delete child tables first
    await Expense.destroy({ where: {} });
    await Budget.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Re-enable foreign keys
    await sequelize.query("PRAGMA foreign_keys = ON");

    // Create test data
    user = await User.create({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      email: "john@example.com",
      password: "Password123!",
    });

    budget = await Budget.create({
      userId: user.id,
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      budget: 1000,
      remainingBudget: 1000,
      currency: "EUR",
      isClosed: false,
    });
  });

  it("updates budget and remainingBudget correctly", async () => {
    await Expense.bulkCreate([
      {
        userId: user.id,
        amount: 200,
        date: "2026-01-10",
        categoryId: 1,
        isPeriodic: false,
      },
      {
        userId: user.id,
        amount: 300,
        date: "2026-01-20",
        categoryId: 1,
        isPeriodic: false,
      },
    ]);

    const newBudgetAmount = 2000;
    const updatedBudget = await updateBudget(
      user.id,
      newBudgetAmount,
      "EUR",
      Budget,
      Expense,
    );

    expect(Number(updatedBudget.budget)).toBe(newBudgetAmount);
    expect(Number(updatedBudget.remainingBudget)).toBe(newBudgetAmount - 500); // 2000 - (200 + 300)
  });

  it("throws 404 if no active budget exists", async () => {
    await budget.update({ isClosed: true });

    await expect(
      updateBudget(user.id, 1500, "EUR", Budget, Expense),
    ).rejects.toEqual({
      status: 404,
      message: "User does not have a budget",
    });
  });

  it("throws 400 if budget is invalid", async () => {
    await expect(
      updateBudget(user.id, -500, "EUR", Budget, Expense),
    ).rejects.toEqual({
      status: 400,
      message: "Please enter a valid budget.",
    });
  });
});

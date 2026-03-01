import { Sequelize } from "sequelize";
import bcrypt from "bcrypt";

import defineUserModel from "../../../../models/user.model.js";
import defineBudgetModel from "../../../../models/budget.model.js";
import defineCategoryModel from "../../../../models/category.model.js";
import defineExpenseModel from "../../../../models/expense.model.js";

import { deleteUserExpense } from "../../../../services/expenseService.js";
import getUserBudget from "../../../../utils/budget/getUserBudget.js";

let sequelize;
let User, Budget, Category, Expense;
let testUser, testBudget, testCategory, testExpense;

beforeAll(async () => {
  sequelize = new Sequelize("sqlite::memory:", { logging: false });

  User = defineUserModel(sequelize, Sequelize);
  Budget = defineBudgetModel(sequelize, Sequelize);
  Category = defineCategoryModel(sequelize, Sequelize);
  Expense = defineExpenseModel(sequelize, Sequelize);

  // Асоции
  User.hasMany(Budget, { foreignKey: "userId" });
  Budget.belongsTo(User, { foreignKey: "userId" });
  Expense.belongsTo(User, { foreignKey: "userId" });
  Expense.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  await sequelize.sync({ force: true });

  testUser = await User.create({
    firstName: "John",
    lastName: "Doe",
    age: 30,
    email: "john@example.com",
    password: await bcrypt.hash("Password123!", 10),
  });

  const now = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  testBudget = await Budget.create({
    userId: testUser.id,
    startDate: now,
    endDate: end,
    budget: 1000,
    remainingBudget: 1000,
    currency: "EUR",
    isClosed: false,
  });

  testCategory = await Category.create({ name: "Food" });

  testExpense = await Expense.create({
    userId: testUser.id,
    categoryId: testCategory.id,
    amount: 100,
    date: now,
    notes: "Lunch",
    isPeriodic: false, // <- Трябва да е винаги зададено
  });

  // Актуализиране на budget за тест
  testBudget.remainingBudget -= testExpense.amount;
  await testBudget.save();
});

afterAll(async () => {
  await sequelize.close();
});

describe("deleteUserExpense Integration Tests", () => {
  it("deletes an existing expense and updates budget", async () => {
    const budgetBefore = await getUserBudget(testUser.id, Budget);

    const result = await deleteUserExpense(testUser.id, testExpense.id, Expense, Budget, sequelize);

    expect(result).toBeDefined();
    expect(Number(result.remainingBudget)).toBe(Number(budgetBefore.data.remainingBudget) + 100);

    const deletedExpense = await Expense.findByPk(testExpense.id);
    expect(deletedExpense).toBeNull();
  });

  it("returns 404 if expense does not exist", async () => {
    await expect(deleteUserExpense(testUser.id, 9999, Expense, Budget, sequelize))
      .rejects.toEqual({ status: 404, message: "Expense not found." });
  });

  it("throws error if expense is outside budget period", async () => {
    const pastExpense = await Expense.create({
      userId: testUser.id,
      categoryId: testCategory.id,
      amount: 50,
      date: new Date("2000-01-01"),
      notes: "Old expense",
      isPeriodic: false, // <- Трябва да е винаги зададено
    });

    await expect(deleteUserExpense(testUser.id, pastExpense.id, Expense, Budget, sequelize))
      .rejects.toEqual({
        status: 403,
        message: "Expenses can be deleted only for the current budget period."
      });
  });

  it("throws error if invalid expenseId is passed", async () => {
    await expect(deleteUserExpense(testUser.id, "abc", Expense, Budget, sequelize))
      .rejects.toEqual({ status: 400, message: "Expense not found." });
  });
});
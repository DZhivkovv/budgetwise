import { Sequelize } from "sequelize";
import bcrypt from "bcrypt";

import defineUserModel from "../../../../models/user.model.js";
import defineBudgetModel from "../../../../models/budget.model.js";
import defineCategoryModel from "../../../../models/category.model.js";
import defineExpenseModel from "../../../../models/expense.model.js";
import defineGoalModel from "../../../../models/goal.model.js";

import { updateUserExpense } from "../../../../services/expenseService.js";

let sequelize;
let User, Budget, Category, Expense, Goal;
let testUser, testBudget, testCategory, initialExpense;

beforeAll(async () => {
  sequelize = new Sequelize("sqlite::memory:", { logging: false });

  // Define models
  User = defineUserModel(sequelize, Sequelize);
  Budget = defineBudgetModel(sequelize, Sequelize);
  Category = defineCategoryModel(sequelize, Sequelize);
  Expense = defineExpenseModel(sequelize, Sequelize);
  Goal = defineGoalModel(sequelize, Sequelize);

  // Define associations
  User.hasMany(Budget, { foreignKey: "userId" });
  Budget.belongsTo(User, { foreignKey: "userId" });
  Budget.hasMany(Expense, { foreignKey: "budgetId" });
  Expense.belongsTo(Budget, { foreignKey: "budgetId" });
  Expense.belongsTo(User, { foreignKey: "userId" });
  Expense.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  await sequelize.sync({ force: true });

  // Create test user
  testUser = await User.create({
    firstName: "John",
    lastName: "Doe",
    age: 30,
    email: "edit@example.com",
    password: await bcrypt.hash("Password123!", 10),
  });

  // Create test budget
  const now = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  testBudget = await Budget.create({
    userId: testUser.id,
    startDate: now,
    endDate: end,
    budget: 1000,
    remainingBudget: 800, // Starting with 200 spent
    currency: "EUR",
    isClosed: false,
  });

  testCategory = await Category.create({ name: "Bills" });

  // Create initial expense to be updated
  initialExpense = await Expense.create({
    userId: testUser.id,
    categoryId: testCategory.id,
    amount: 200,
    date: new Date().toISOString().split("T")[0],
    isPeriodic: false,
    notes: "Original bill",
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe("updateUserExpense Integration Tests", () => {
  
  it("successfully updates an expense amount and adjusts remaining budget (increase amount)", async () => {
    // Current: Remaining 800, Expense 200 -> Update to 250 (Diff: +50)
    // Expect: Remaining 750
    const updateData = {
      id: initialExpense.id,
      categoryId: testCategory.id,
      amount: 250,
      date: new Date().toISOString().split("T")[0],
      isPeriodic: false,
      notes: "Increased cost",
    };

    const result = await updateUserExpense(testUser.id, updateData, Expense, Category, Budget, sequelize);

    expect(result.expense.amount).toBe(250);
    const updatedBudget = await Budget.findByPk(testBudget.id);
    expect(Number(updatedBudget.remainingBudget)).toBe(750);
  });

  it("successfully updates an expense amount and adjusts remaining budget (decrease amount)", async () => {
    // Current: Remaining 750, Expense 250 -> Update to 100 (Diff: -150)
    // Expect: Remaining 900
    const updateData = {
      id: initialExpense.id,
      categoryId: testCategory.id,
      amount: 100,
      date: new Date().toISOString().split("T")[0],
      isPeriodic: false,
    };

    const result = await updateUserExpense(testUser.id, updateData, Expense, Category, Budget, sequelize);

    expect(result.expense.amount).toBe(100);
    const updatedBudget = await Budget.findByPk(testBudget.id);
    expect(Number(updatedBudget.remainingBudget)).toBe(900);
  });

  it("throws error if the budget doesn't exist for the provided user ID", async () => {
    const updateData = {
      id: initialExpense.id,
      categoryId: testCategory.id,
      amount: 100,
      date: new Date().toISOString().split("T")[0],
      isPeriodic: false,
    };

    // Fails at the first check: getUserBudget(999)
    await expect(
      updateUserExpense(999, updateData, Expense, Category, Budget, sequelize)
    ).rejects.toEqual({
      status: 404,
      message: "User budget not found.",
    });
  });

  it("throws error when the expense ID does not exist for a valid user", async () => {
    const updateData = {
      id: 9999, // Non-existent ID
      categoryId: testCategory.id,
      amount: 100,
      date: new Date().toISOString().split("T")[0],
      isPeriodic: false,
    };

    // Passes budget check, but fails at ExpenseModel.findOne
    await expect(
      updateUserExpense(testUser.id, updateData, Expense, Category, Budget, sequelize)
    ).rejects.toEqual({
      status: 404,
      message: "Expense not found.",
    });
  });

  it("throws error if the updated date falls outside the budget range", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    const updateData = {
      id: initialExpense.id,
      categoryId: testCategory.id,
      amount: 100,
      date: futureDate.toISOString().split("T")[0],
      isPeriodic: false,
    };

    await expect(
      updateUserExpense(testUser.id, updateData, Expense, Category, Budget, sequelize)
    ).rejects.toEqual({
      status: 403,
      message: "Expenses can be updated only for the current budget period.",
    });
  });
});
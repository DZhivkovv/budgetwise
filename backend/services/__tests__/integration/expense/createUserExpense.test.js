import { Sequelize } from "sequelize";
import bcrypt from "bcrypt";

import defineUserModel from "../../../../models/user.model.js";
import defineBudgetModel from "../../../../models/budget.model.js";
import defineCategoryModel from "../../../../models/category.model.js";
import defineExpenseModel from "../../../../models/expense.model.js";
import defineGoalModel from "../../../../models/goal.model.js";

import { createUserExpense } from "../../../../services/expenseService.js";

let sequelize;
let User, Budget, Category, Expense;
let testUser, testBudget, testCategory;

beforeAll(async () => {
  sequelize = new Sequelize("sqlite::memory:", { logging: false });

  // Дефинираме моделите
  User = defineUserModel(sequelize, Sequelize);
  Budget = defineBudgetModel(sequelize, Sequelize);
  Category = defineCategoryModel(sequelize, Sequelize);
  Expense = defineExpenseModel(sequelize, Sequelize);
  Goal = defineGoalModel(sequelize, Sequelize);


  // Дефинираме асоциации **след като всички модели са създадени**
  User.hasMany(Budget, { foreignKey: "userId" });
  Budget.belongsTo(User, { foreignKey: "userId" });
  Budget.hasMany(Expense, { foreignKey: "budgetId" });
  Expense.belongsTo(Budget, { foreignKey: "budgetId" });

  Expense.belongsTo(User, { foreignKey: "userId" });
  Expense.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  await sequelize.sync({ force: true });

  // Създаваме тестов потребител
  testUser = await User.create({
    firstName: "John",
    lastName: "Doe",
    age: 30,
    email: "john@example.com",
    password: await bcrypt.hash("Password123!", 10),
  });

  // Създаваме тестов бюджет
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
});

afterAll(async () => {
  await sequelize.close();
});

describe("createUserExpense Integration Tests", () => {
it("creates a new expense and updates budget correctly", async () => {
  const expenseData = {
    categoryId: testCategory.id,
    amount: 100,
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    isPeriodic: false,
    recurringPeriod: null,
    notes: "Lunch",
  };

  const result = await createUserExpense(testUser.id, expenseData, Expense, Category, Budget, Goal, sequelize);

  expect(result.expense).toBeDefined();
  expect(result.expense.amount).toBe(100);

  const updatedBudget = await Budget.findByPk(testBudget.id);
  expect(Number(updatedBudget.remainingBudget)).toBe(900);
});

it("throws an error if expense date is outside budget period", async () => {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 2);

  await expect(
    createUserExpense(testUser.id, {
      categoryId: testCategory.id,
      amount: 50,
      date: futureDate.toISOString().split("T")[0],
      isPeriodic: false,
      recurringPeriod: null,
      notes: "Out of range",
    },
     Expense, Category, Budget, sequelize
    )
  ).rejects.toEqual({
    status: 403,
    message: "Expenses can be added only for the current budget period.",
  });
});


});
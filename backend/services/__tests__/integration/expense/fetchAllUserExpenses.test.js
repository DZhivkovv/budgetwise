import { Sequelize } from "sequelize";
import defineUserModel from "../../../../models/user.model.js";
import defineBudgetModel from "../../../../models/budget.model.js";
import defineCategoryModel from "../../../../models/category.model.js";
import defineExpenseModel from "../../../../models/expense.model.js";

import { fetchAllUserExpenses } from "../../../../services/expenseService.js";

let sequelize;
let User, Budget, Category, Expense;
let testUser, testCategory;

beforeAll(async () => {
  sequelize = new Sequelize("sqlite::memory:", { logging: false });

  // 1. Define models
  User = defineUserModel(sequelize, Sequelize);
  Budget = defineBudgetModel(sequelize, Sequelize);
  Category = defineCategoryModel(sequelize, Sequelize);
  Expense = defineExpenseModel(sequelize, Sequelize);

  // 2. Define associations (Match your function's "include" logic)
  User.hasMany(Budget, { foreignKey: "userId", as: "budgets" });
  Budget.belongsTo(User, { foreignKey: "userId", as: "users" });
  
  User.hasMany(Expense, { foreignKey: "userId" });
  Expense.belongsTo(User, { foreignKey: "userId", as: "users" });

  Category.hasMany(Expense, { foreignKey: "categoryId" });
  Expense.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  await sequelize.sync({ force: true });

  // 3. Seed data
  testUser = await User.create({
    firstName: "Alice",
    lastName: "Wonderland",
    age: 25,
    email: "alice@example.com",
    password: "hashed_password",
  });

  await Budget.create({
    userId: testUser.id,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    budget: 2000,
    remainingBudget: 2000,
    currency: "USD",
  });

  testCategory = await Category.create({ name: "Entertainment" });

  await Expense.create({
    userId: testUser.id,
    categoryId: testCategory.id,
    amount: 50.0,
    date: "2023-05-10",
    isPeriodic: false,
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe("fetchAllUserExpenses Integration Tests", () => {
  
  it("fetches expenses with category names and user budget currency", async () => {
    const expenses = await fetchAllUserExpenses(
      testUser.id,
      User,
      Expense,
      Budget,
      Category
    );

    // Verify expense array
    expect(Array.isArray(expenses)).toBe(true);
    expect(expenses.length).toBe(1);

    const expense = expenses[0];

    // Verify Category Include
    expect(expense.category.name).toBe("Entertainment");

    // Verify Nested User -> Budget Include
    // Accessing through 'users' alias as defined in your fetchAllUserExpenses function
    expect(expense.users).toBeDefined();
    expect(expense.users.budgets).toBeDefined();
    expect(expense.users.budgets[0].currency).toBe("USD");
  });

  it("returns an empty array for a user with no expenses", async () => {
    const newUser = await User.create({
      firstName: "Empty",
      lastName: "User",
      age: 25,
      email: "empty@example.com",
      password: "password",
    });

    const expenses = await fetchAllUserExpenses(
      newUser.id,
      User,
      Expense,
      Budget,
      Category
    );

    expect(expenses).toEqual([]);
  });
});
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { Sequelize } from "sequelize";

import BudgetModel from "../../../../models/budget.model.js";
import UserModel from "../../../../models/user.model.js";
import CategoryModel from "../../../../models/category.model.js";
import { sequelize } from "../../../../db/testDb.js";
import { getAllBudgets } from "../../../budgetService.js";

const User = UserModel(sequelize, Sequelize);
const Budget = BudgetModel(sequelize, Sequelize);

describe("getAllBudgets – DB integration (SQLite)", () => {
  let user, anotherUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Budget.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    user = await User.create({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      email: "john@example.com",
      password: "Password123!",
    });

    anotherUser = await User.create({
      firstName: "Jane",
      lastName: "Smith",
      age: 30,
      email: "jane@example.com",
      password: "Password123!",
    });
  });

  it("returns all budgets for a user", async () => {
    await Budget.bulkCreate([
      {
        userId: user.id,
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        budget: 1000,
        remainingBudget: 1000,
        currency: "USD",
        isClosed: false,
      },
      {
        userId: user.id,
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        budget: 2000,
        remainingBudget: 2000,
        currency: "USD",
        isClosed: false,
      },
      {
        userId: anotherUser.id,
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        budget: 500,
        remainingBudget: 500,
        currency: "USD",
        isClosed: false,
      },
    ]);

    const budgets = await getAllBudgets(user.id, Budget);
    expect(budgets).toHaveLength(2);
    budgets.forEach((b) => expect(b.userId).toBe(user.id));
  });

  it("returns empty array if user has no budgets", async () => {
    const budgets = await getAllBudgets(anotherUser.id, Budget);
    expect(budgets).toHaveLength(0);
  });
});

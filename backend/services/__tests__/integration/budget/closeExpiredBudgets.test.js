import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { Sequelize, Op } from "sequelize";

import BudgetModel from "../../../../models/budget.model.js";
import UserModel from "../../../../models/user.model.js";
import { sequelize } from "../../../../db/testDb.js";
import { closeExpiredBudgets } from "../../../../middleware/closeExpiredBudgets.js";

const User = UserModel(sequelize, Sequelize);
const Budget = BudgetModel(sequelize, Sequelize);

describe("closeExpiredBudgets middleware – DB integration", () => {
  let user;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Budget.destroy({ where: {} });
    await User.destroy({ where: {} });

    user = await User.create({
      firstName: "Test",
      lastName: "User",
      age: 25,
      email: `test_${Date.now()}@test.com`,
      password: "password123",
    });
  });

  it("closes expired budgets", async () => {
    const today = new Date();

    // Use a date clearly in the past (e.g., 7 days ago) to avoid "today" overlaps
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const expiredBudget = await Budget.create({
      userId: user.id,
      budget: 1000,
      remainingBudget: 500,
      currency: "EUR",
      isClosed: false,
      startDate: "2026-01-01",
      endDate: sevenDaysAgo,
    });

    const activeBudget = await Budget.create({
      userId: user.id,
      budget: 2000,
      remainingBudget: 2000,
      currency: "EUR",
      isClosed: false,
      startDate: "2026-02-01",
      endDate: "2026-12-31", // Far future
    });

    const req = {};
    const res = {};
    let nextCalled = false;
    const next = (err) => {
      if (err) console.error("Middleware error:", err);
      nextCalled = true;
    };

    await closeExpiredBudgets(req, res, next, Budget);

    // Use .reload() to fetch the latest data from the DB into the existing objects
    await expiredBudget.reload();
    await activeBudget.reload();

    expect(expiredBudget.isClosed).toBe(true); // This was failing
    expect(activeBudget.isClosed).toBe(false);
    expect(nextCalled).toBe(true);
  });

  it("does not fail if no budgets are expired", async () => {
    const futureBudget = await Budget.create({
      userId: user.id,
      budget: 1500,
      remainingBudget: 1500,
      currency: "EUR",
      isClosed: false,
      startDate: "2026-02-01",
      endDate: "2026-02-28",
    });

    const req = {};
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    await closeExpiredBudgets(req, res, next, Budget);

    const updatedBudget = await Budget.findByPk(futureBudget.id);
    expect(updatedBudget.isClosed).toBe(false);
    expect(nextCalled).toBe(true);
  });
});

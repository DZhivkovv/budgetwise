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
import { getActiveBudget } from "../../../budgetService.js";

const User = UserModel(sequelize, Sequelize);
const Budget = BudgetModel(sequelize, Sequelize);

describe("getActiveBudget – DB integration (SQLite)", () => {
  let user;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Изчисти таблиците
    await Budget.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    // Създай потребител
    user = await User.create({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      email: "john@example.com",
      password: "Password123!",
    });
  });

  it("returns the active budget if one exists", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const budget = await Budget.create({
      userId: user.id,
      startDate: new Date(today.getTime() - 1000 * 60 * 60 * 24), // вчера
      endDate: new Date(today.getTime() + 1000 * 60 * 60 * 24), // утре
      isClosed: false,
      budget: 1000.0,
      remainingBudget: 1000.0,
      currency: "USD",
    });

    const activeBudget = await getActiveBudget(user.id, Budget);
    expect(activeBudget).not.toBeNull();
    expect(activeBudget.id).toBe(budget.id);
  });

  it("returns null if no active budget exists", async () => {
    const activeBudget = await getActiveBudget(user.id, Budget);
    expect(activeBudget).toBeNull();
  });

  it("ignores closed budgets", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Budget.create({
      userId: user.id,
      startDate: new Date(today.getTime() - 1000 * 60 * 60 * 24),
      endDate: new Date(today.getTime() + 1000 * 60 * 60 * 24),
      isClosed: true,
      budget: 1000.0,
      remainingBudget: 1000.0,
      currency: "USD",
    });

    const activeBudget = await getActiveBudget(user.id, Budget);
    expect(activeBudget).toBeNull();
  });

  it("ignores budgets outside the date range", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Budget в бъдещето
    await Budget.create({
      userId: user.id,
      startDate: new Date(today.getTime() + 1000 * 60 * 60 * 24),
      endDate: new Date(today.getTime() + 1000 * 60 * 60 * 48),
      isClosed: false,
      budget: 1000.0,
      remainingBudget: 1000.0,
      currency: "USD",
    });

    // Budget изтекъл
    await Budget.create({
      userId: user.id,
      startDate: new Date(today.getTime() - 1000 * 60 * 60 * 48),
      endDate: new Date(today.getTime() - 1000 * 60 * 60 * 24),
      isClosed: false,
      budget: 1000.0,
      remainingBudget: 1000.0,
      currency: "USD",
    });

    const activeBudget = await getActiveBudget(user.id, Budget);
    expect(activeBudget).toBeNull();
  });
});

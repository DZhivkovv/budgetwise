import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import { Sequelize } from "sequelize";

import UserModel from "../../../../models/user.model.js";
import BudgetModel from "../../../../models/budget.model.js";
import { sequelize } from "../../../../db/testDb.js";
import { createBudget } from "../../../budgetService.js";

const User = UserModel(sequelize, Sequelize);
const Budget = BudgetModel(sequelize, Sequelize);

describe("createBudget – DB integration (SQLite)", () => {
  let user;

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
  });

  it("creates a new budget successfully", async () => {
    const budgetAmount = 1000;
    const newBudget = await createBudget(user.id, budgetAmount, Budget);

    expect(newBudget).toBeDefined();
    expect(newBudget.userId).toBe(user.id);
    expect(Number(newBudget.budget)).toBe(budgetAmount);
    expect(Number(newBudget.remainingBudget)).toBe(budgetAmount);
    expect(newBudget.currency).toBe("EUR");
    expect(newBudget.isClosed).toBe(false);
  });

  it("throws 409 if overlapping budget exists", async () => {
    const budgetAmount = 1000;
    await createBudget(user.id, budgetAmount, Budget);

    await expect(createBudget(user.id, budgetAmount, Budget)).rejects.toEqual({
      status: 409,
      message: "An active budget already exists for this period",
    });
  });

  it("throws error if budget is invalid", async () => {
    await expect(createBudget(user.id, -100, Budget)).rejects.toEqual({
      status: 400,
      message: "Please enter a valid budget.",
    });
  });
});

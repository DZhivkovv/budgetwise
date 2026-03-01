import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { Sequelize } from "sequelize";

import { sequelize } from "../../../../db/testDb.js";

import UserModel from "../../../../models/user.model.js";
import GoalModel from "../../../../models/goal.model.js";
import CategoryModel from "../../../../models/category.model.js";

import { updateGoalProgressFromExpense } from "../../../goalsService.js";

let User;
let Goal;
let Category;

describe("updateGoalProgressFromExpense Integration Test", () => {
  beforeAll(async () => {
    User = UserModel(sequelize, Sequelize);
    Goal = GoalModel(sequelize, Sequelize);
    Category = CategoryModel(sequelize, Sequelize);

    Goal.belongsTo(User, { foreignKey: "userId" });
    Goal.belongsTo(Category, { foreignKey: "categoryId" });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Goal.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  const createTestUser = async () => {
    return User.create({
      firstName: "Test",
      lastName: "User",
      age: 25,
      email: `test_${Date.now()}@test.com`,
      password: "hashed-password",
    });
  };

  const createTestCategory = async (name = "Food") => {
    return Category.create({
      name,
      type: "expense",
    });
  };

  const createTestGoal = async ({ userId, categoryId, targetAmount = 1000, currentAmount = 0, status = "active" }) => {
    return Goal.create({
      userId,
      categoryId,
      type: "saving",
      status,
      targetAmount,
      currentAmount,
      deadline: "2026-12-31",
    });
  };

  it("updates goal progress correctly when adding expense", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({ userId: user.id, categoryId: category.id, currentAmount: 200 });

    const updated = await updateGoalProgressFromExpense(user.id, { categoryId: category.id, amount: 300 }, null, Goal);

    expect(updated.currentAmount).toBe(500);
    expect(updated.status).toBe("active");
  });

  it("completes goal when currentAmount exceeds targetAmount", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({ userId: user.id, categoryId: category.id, currentAmount: 800, targetAmount: 1000 });

    const updated = await updateGoalProgressFromExpense(user.id, { categoryId: category.id, amount: 250 }, null, Goal);

    expect(Number(updated.currentAmount)).toBe(1050);
    expect(updated.status).toBe("completed");
  });

  it("returns null if no active goal exists for the category", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const result = await updateGoalProgressFromExpense(user.id, { categoryId: category.id, amount: 100 }, null, Goal);

    expect(result).toBeNull();
  });

  it("updates goal inside a transaction", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({ userId: user.id, categoryId: category.id, currentAmount: 100 });

    const transaction = await sequelize.transaction();

    await updateGoalProgressFromExpense(user.id, { categoryId: category.id, amount: 150 }, transaction, Goal);

    await transaction.commit();

    const savedGoal = await Goal.findByPk(goal.id);
    expect(savedGoal.currentAmount).toBe(250);
  });
});
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { Sequelize } from "sequelize";

import { sequelize } from "../../../../db/testDb.js";

import UserModel from "../../../../models/user.model.js";
import GoalModel from "../../../../models/goal.model.js";
import CategoryModel from "../../../../models/category.model.js";

import { createGoal } from "../../../goalsService.js";

let User;
let Goal;
let Category;

describe("createGoal Integration Test", () => {
  beforeAll(async () => {
    User = UserModel(sequelize, Sequelize);
    Goal = GoalModel(sequelize, Sequelize);
    Category = CategoryModel(sequelize, Sequelize);

    // 👉 Associations (ВАЖНО)
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

  const createTestCategory = async () => {
    return Category.create({
      name: "Food",
      type: "expense",
    });
  };

  it("creates a goal successfully", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const data = {
      categoryId: category.id,
      type: "saving",
      targetAmount: 1000,
      currentAmount: 0,
      deadline: "2026-01-01",
    };

    const goal = await createGoal(user.id, data, null, Goal);

    expect(goal).toBeDefined();
    expect(goal.userId).toBe(user.id);
    expect(goal.categoryId).toBe(category.id);
    expect(goal.status).toBe("active");
  });

  it("throws ACTIVE_GOAL_EXISTS if active goal already exists", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    await Goal.create({
      userId: user.id,
      categoryId: category.id,
      type: "saving",
      status: "active",
      targetAmount: 1000,
      currentAmount: 200,
      deadline: "2026-01-01",
    });

    const data = {
      categoryId: category.id,
      type: "saving",
      targetAmount: 500,
      currentAmount: 0,
      deadline: "2026-06-01",
    };

    await expect(
      createGoal(user.id, data, null, Goal)
    ).rejects.toThrow("ACTIVE_GOAL_EXISTS");
  });

  it("allows creating goal if previous goal is completed", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    await Goal.create({
      userId: user.id,
      categoryId: category.id,
      type: "saving",
      status: "completed",
      targetAmount: 1000,
      currentAmount: 1000,
      deadline: "2025-01-01",
    });

    const data = {
      categoryId: category.id,
      type: "saving",
      targetAmount: 2000,
      currentAmount: 0,
      deadline: "2027-01-01",
    };

    const goal = await createGoal(user.id, data, null, Goal);

    expect(goal).toBeDefined();
    expect(goal.status).toBe("active");
  });

  it("creates goal inside a transaction", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const transaction = await sequelize.transaction();

    const data = {
      categoryId: category.id,
      type: "spending",
      targetAmount: 300,
      currentAmount: 0,
      deadline: "2026-03-01",
    };

    const goal = await createGoal(user.id, data, transaction, Goal);
    await transaction.commit();

    const savedGoal = await Goal.findByPk(goal.id);
    expect(savedGoal).not.toBeNull();
  });
});
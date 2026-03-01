import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { Sequelize } from "sequelize";

import { sequelize } from "../../../../db/testDb.js";

import UserModel from "../../../../models/user.model.js";
import GoalModel from "../../../../models/goal.model.js";
import CategoryModel from "../../../../models/category.model.js";

import { updateGoal } from "../../../goalsService.js";

let User;
let Goal;
let Category;

describe("updateGoal Integration Test", () => {
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

  const createTestCategory = async (name = "Food") => {
    return Category.create({
      name,
      type: "expense",
    });
  };

  const createTestGoal = async ({
    userId,
    categoryId,
    status = "active",
    type = "saving",
    targetAmount = 1000,
    currentAmount = 0,
  }) => {
    return Goal.create({
      userId,
      categoryId,
      type,
      status,
      targetAmount,
      currentAmount,
      deadline: "2026-01-01",
    });
  };

  it("updates goal successfully", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({
      userId: user.id,
      categoryId: category.id,
    });

    const updated = await updateGoal(user.id, {
      id: goal.id,
      targetAmount: 2000,
      deadline: "2027-01-01",
    }, null, Goal);

    expect(updated.targetAmount).toBe(2000);
    expect(updated.deadline).toBe("2027-01-01");
  });

  it("returns null if goal does not exist", async () => {
    const user = await createTestUser();

    const result = await updateGoal(user.id, {
      id: 999,
      targetAmount: 500,
    }, null, Goal);

    expect(result).toBeNull();
  });

  it("throws ACTIVE_GOAL_EXISTS when activating conflicting goal", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    await createTestGoal({
        userId: user.id,
        categoryId: category.id,
        status: "active",
        type: "saving",
    });

    const secondGoal = await createTestGoal({
        userId: user.id,
        categoryId: category.id,
        status: "completed",
        type: "saving",
    });

    await expect(
    updateGoal(user.id, {
        id: secondGoal.id,
        status: "active",
        categoryId: category.id,
        type: "saving",
    }, null, Goal)
    ).rejects.toThrow("ACTIVE_GOAL_EXISTS");
  });

  it("allows update if category/type not changed", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({
      userId: user.id,
      categoryId: category.id,
    });

    const updated = await updateGoal(user.id, {
      id: goal.id,
      deadline: "2028-01-01",
    }, null, Goal);

    expect(updated.deadline).toBe("2028-01-01");
  });

  it("automatically completes goal when currentAmount >= targetAmount", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({
      userId: user.id,
      categoryId: category.id,
      targetAmount: 500,
      currentAmount: 500,
    });

    const updated = await updateGoal(user.id, {
      id: goal.id,
      targetAmount: 500,
    }, null, Goal);

    expect(updated.status).toBe("completed");
  });

  it("updates goal inside a transaction", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({
      userId: user.id,
      categoryId: category.id,
    });

    const transaction = await sequelize.transaction();

    await updateGoal(
      user.id,
      {
        id: goal.id,
        targetAmount: 3000,
      },
      transaction,
      Goal
    );

    await transaction.commit();

    const updated = await Goal.findByPk(goal.id);
    expect(updated.targetAmount).toBe(3000);
  });
});
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { Sequelize } from "sequelize";

import { sequelize } from "../../../../db/testDb.js";

import UserModel from "../../../../models/user.model.js";
import GoalModel from "../../../../models/goal.model.js";
import CategoryModel from "../../../../models/category.model.js";

import { deleteGoal } from "../../../goalsService.js";

let User;
let Goal;
let Category;

describe("deleteGoal Integration Test", () => {
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

  it("deletes a goal successfully", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({ userId: user.id, categoryId: category.id });

    const deleted = await deleteGoal(user.id, { id: goal.id }, null, Goal);

    expect(deleted).toBeDefined();
    expect(deleted.id).toBe(goal.id);

    const shouldBeNull = await Goal.findByPk(goal.id);
    expect(shouldBeNull).toBeNull();
  });

  it("returns null if goal does not exist", async () => {
    const user = await createTestUser();

    const result = await deleteGoal(user.id, { id: 999 }, null, Goal);

    expect(result).toBeNull();
  });

  it("deletes goal inside a transaction", async () => {
    const user = await createTestUser();
    const category = await createTestCategory();

    const goal = await createTestGoal({ userId: user.id, categoryId: category.id });

    const transaction = await sequelize.transaction();

    const deleted = await deleteGoal(user.id, { id: goal.id }, transaction, Goal);

    await transaction.commit();

    expect(deleted).toBeDefined();
    const shouldBeNull = await Goal.findByPk(goal.id);
    expect(shouldBeNull).toBeNull();
  });
});
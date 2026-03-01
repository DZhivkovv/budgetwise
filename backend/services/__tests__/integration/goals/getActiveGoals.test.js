import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { Sequelize } from "sequelize";
import { sequelize } from "../../../../db/testDb.js";
import UserModel from "../../../../models/user.model.js";
import GoalModel from "../../../../models/goal.model.js";
import CategoryModel from "../../../../models/category.model.js";
import { getActiveGoals } from "../../../goalsService.js";

let User, Goal, Category;
let category; // reusable category

describe("getActiveGoals Integration Test", () => {
  beforeAll(async () => {
    // Initialize models with the test sequelize instance
    User = UserModel(sequelize, Sequelize);
    Category = CategoryModel(sequelize, Sequelize);
    Goal = GoalModel(sequelize, Sequelize);

    // Proper associations on the exact model instances used in the test
    Goal.belongsTo(User, { foreignKey: "userId" });
    Goal.belongsTo(Category, { foreignKey: "categoryId" });
    Category.hasMany(Goal, { foreignKey: "categoryId" });

    // Sync DB after defining associations
    await sequelize.sync({ force: true });

    // Create a single category for reuse in all tests
    category = await Category.create({ name: "Food" });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Only clean goals and users; keep category
    await Goal.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  // Helper to create a user
  const createTestUser = async () =>
    User.create({
      firstName: "Test",
      lastName: "User",
      age: 25,
      email: `test_${Date.now()}@test.com`,
      password: "hashed-password",
    });

  // Helper to create a goal
  const createTestGoal = async ({
    userId,
    status = "active",
    type = "saving",
    targetAmount = 1000,
    currentAmount = 0,
  }) =>
    Goal.create({
      userId,
      categoryId: category.id, // always use the reusable category
      type,
      status,
      targetAmount,
      currentAmount,
      deadline: "2026-01-01",
    });

  it("returns all active goals for a user with category included", async () => {
    const user = await createTestUser();

    await createTestGoal({ userId: user.id });
    await createTestGoal({ userId: user.id });

    const goals = await getActiveGoals(user.id, Goal, Category);

    expect(goals.length).toBe(2);
    expect(goals[0].status).toBe("active");
    expect(goals[0].category).toBeDefined();
    expect(goals[0].category.name).toBe(category.name);
  });

  it("does not return completed or expired goals", async () => {
    const user = await createTestUser();

    await createTestGoal({ userId: user.id, status: "completed" });
    await createTestGoal({ userId: user.id, status: "expired" });

    const goals = await getActiveGoals(user.id, Goal, Category);
    expect(goals.length).toBe(0);
  });

  it("returns goals in descending order of creation", async () => {
    const user = await createTestUser();

    const firstGoal = await createTestGoal({ userId: user.id });
    await new Promise((res) => setTimeout(res, 10)); // ensure different createdAt
    const secondGoal = await createTestGoal({ userId: user.id });

    const goals = await getActiveGoals(user.id, Goal, Category);

    expect(goals[0].id).toBe(secondGoal.id);
    expect(goals[1].id).toBe(firstGoal.id);
  });
});
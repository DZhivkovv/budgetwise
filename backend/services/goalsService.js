import { Op } from "sequelize";
import db from "../models/index.js";

/**
 * Returns all active goals for a user, including category info.
 *
 * @param {number} userId - The ID of the user.
 * @param {Object} GoalModel - The Goal model (Sequelize instance).
 * @param {Object} CategoryModel - The Category model (Sequelize instance).
 * @returns {Promise<Array>} - Array of active goals with included Category.
 */
export async function getActiveGoals(
  userId,
  GoalModel = db.Goal,
  CategoryModel = db.Category,
) {
  if (!userId) throw { status: 401, message: "Invalid userId" };
  const activeGoals = await GoalModel.findAll({
    where: {
      userId,
      status: "active",
    },
    include: [
      {
        model: CategoryModel,
        attributes: ["id", "name"], // избирай само нужните полета
        required: true, // прави INNER JOIN
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return activeGoals;
}

export async function createGoal(
  userId,
  data,
  transaction = null,
  GoalModel = db.Goal,
) {
  const existingActiveGoal = await GoalModel.findOne({
    where: {
      userId,
      categoryId: data.categoryId,
      type: data.type,
      status: "active",
    },
    transaction: transaction || undefined,
  });

  if (existingActiveGoal) {
    throw new Error("ACTIVE_GOAL_EXISTS");
  }

  return GoalModel.create(
    { userId, ...data },
    transaction ? { transaction } : undefined,
  );
}

export async function updateGoal(
  userId,
  data,
  transaction = null,
  GoalModel = db.Goal,
) {
  const goal = await GoalModel.findOne({
    where: { id: data.id, userId },
    transaction: transaction || undefined,
  });

  if (!goal) {
    return null;
  }

  const willBeActive =
    (data.status && data.status === "active") ||
    (!data.status && goal.status === "active");

  const categoryOrTypeChanged =
    data.categoryId !== undefined || data.type !== undefined;

  if (willBeActive && categoryOrTypeChanged) {
    const existingActiveGoal = await GoalModel.findOne({
      where: {
        userId,
        categoryId: data.categoryId ?? goal.categoryId,
        type: data.type ?? goal.type,
        status: "active",
        id: { [Op.ne]: goal.id },
      },
      transaction: transaction || undefined,
    });

    if (existingActiveGoal) {
      throw new Error("ACTIVE_GOAL_EXISTS");
    }
  }

  const newTargetAmount = data.targetAmount ?? goal.targetAmount;
  let newStatus = data.status ?? goal.status;

  if (goal.currentAmount >= newTargetAmount) {
    newStatus = "completed";
  }

  await goal.update(
    {
      targetAmount: newTargetAmount,
      deadline: data.deadline ?? goal.deadline,
      categoryId: data.categoryId ?? goal.categoryId,
      type: data.type ?? goal.type,
      status: newStatus,
    },
    transaction ? { transaction } : undefined,
  );

  return goal;
}

export async function updateGoalProgressFromExpense(
  userId,
  { categoryId, amount },
  transaction = null,
  GoalModel = db.Goal,
) {
  // Find active goal for this category
  const goal = await GoalModel.findOne({
    where: {
      userId,
      categoryId,
      status: "active",
    },
    transaction: transaction || undefined,
  });

  if (!goal) {
    return null;
  }

  const newAmount = Number(goal.currentAmount) + Number(amount);
  const newStatus =
    newAmount >= Number(goal.targetAmount) ? "completed" : "active";

  await goal.update(
    {
      currentAmount: newAmount,
      status: newStatus,
    },
    transaction ? { transaction } : undefined,
  );

  return goal;
}

/**
 * Deletes a goal for a user.
 *
 * @param {number} userId - The ID of the user who owns the goal.
 * @param {Object} data - Object containing the goal ID to delete.
 * @param {number} data.id - The ID of the goal to delete.
 * @param {Object} [transaction=null] - Optional Sequelize transaction.
 * @returns {Promise<Object|null>} - The deleted Goal instance, or null if not found.
 *
 * @throws {Error} - Throws if there is a database error during deletion.
 */
export async function deleteGoal(
  userId,
  data,
  transaction = null,
  GoalModel = db.Goal,
) {
  // Get the goal to be deleted.
  const goal = await GoalModel.findOne({
    where: { id: data.id, userId },
    transaction: transaction || undefined,
  });

  // If the goal doesn't exist, end the function execution.
  if (!goal) {
    return null;
  }

  // Delete the goal.
  return goal.destroy(transaction ? { transaction } : undefined);
}

import { recalculateActiveGoalForCategory } from "../services/goalsService.js";

export default (sequelize, DataTypes) => {
  const Expense = sequelize.define(
    "expense",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      notes: { type: DataTypes.STRING, allowNull: true },
    },
    { timestamps: true },
  );

  Expense.afterCreate(async (expense, options) => {
    await recalculateActiveGoalForCategory(
      expense.userId,
      expense.categoryId,
      options.transaction,
    );
  });

  Expense.afterDestroy(async (expense, options) => {
    await recalculateActiveGoalForCategory(
      expense.userId,
      expense.categoryId,
      options.transaction,
    );
  });

  Expense.afterUpdate(async (expense, options) => {
    const previousCategoryId = expense._previousDataValues.categoryId;
    const currentCategoryId = expense.categoryId;

    // If category changed → recalc old category
    if (previousCategoryId !== currentCategoryId) {
      await recalculateActiveGoalForCategory(
        expense.userId,
        previousCategoryId,
        options.transaction,
      );
    }

    await recalculateActiveGoalForCategory(
      expense.userId,
      currentCategoryId,
      options.transaction,
    );
  });

  return Expense;
};

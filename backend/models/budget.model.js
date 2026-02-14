export default (sequelize, DataTypes) => {
  const Budget = sequelize.define(
    "Budget",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      startDate: { type: DataTypes.DATEONLY, allowNull: false },
      endDate: { type: DataTypes.DATEONLY, allowNull: false },
      budget: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      remainingBudget: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false },
      isClosed: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "budgets",
      indexes: [
        {
          unique: true,
          fields: ["userId", "startDate", "endDate"],
        },
      ],
      validate: {
        endDateAfterStart() {
          if (this.endDate <= this.startDate) {
            throw new Error("endDate must be after startDate");
          }
        },
      },
    },
  );

  Budget.associate = (models) => {
    Budget.belongsTo(models.User, { foreignKey: "userId" });
    Budget.hasMany(models.Expense, { foreignKey: "budgetId" });
  };

  return Budget;
};

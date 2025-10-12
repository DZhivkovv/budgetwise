export default (sequelize, Sequelize) => {
  const Budget = sequelize.define("budget", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // User ID. References the user with the budget.  
    userId: {
      type: Sequelize.INTEGER,
      unique: true, // keep this only if one budget per user
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    // Budget amount: float number
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    currency: {
      type: Sequelize.ENUM("BGN", "EUR", "USD"),
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  // Return the Budget model to be used elsewhere in the app
  return Budget;
};
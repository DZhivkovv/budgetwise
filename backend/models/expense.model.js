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

  return Expense;
};

export default (sequelize, DataTypes) => {
  const Goal = sequelize.define(
    "goal",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      categoryId: { type: DataTypes.INTEGER, allowNull: false },

      type: { type: DataTypes.ENUM("saving", "spending"), allowNull: false },
      status: {
        type: DataTypes.ENUM("active", "completed", "expired"),
        allowNull: false,
        defaultValue: "active",
      },

      targetAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      currentAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      deadline: { type: DataTypes.DATEONLY, allowNull: false },
    },
    { timestamps: true },
  );

  return Goal;
};

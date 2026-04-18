export default (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "category",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    { timestamps: true },
  );

  return Category;
};

export default (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "category",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    { timestamps: true },
  );

  return Category;
};

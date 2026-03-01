export default (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
  });

  return User;
};

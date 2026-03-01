import dbConfig from "../config/db.config.js";
import { Sequelize } from "sequelize";
import userModel from "./user.model.js";
import categoryModel from "./category.model.js";
import budgetModel from "./budget.model.js";
import expenseModel from "./expense.model.js";
import goalModel from "./goal.model.js";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = userModel(sequelize, Sequelize);
db.Budget = budgetModel(sequelize, Sequelize);
db.Expense = expenseModel(sequelize, Sequelize);
db.Category = categoryModel(sequelize, Sequelize);
db.Goal = goalModel(sequelize, Sequelize);

// Associations
db.Budget.belongsTo(db.User, { foreignKey: "userId", as: "users" });
db.User.hasMany(db.Budget, { foreignKey: "userId", as: "budgets" });

db.Expense.belongsTo(db.User, { foreignKey: "userId", as: "users" });
db.User.hasMany(db.Expense, { foreignKey: "userId", as: "expenses" });

db.Expense.belongsTo(db.Category, { foreignKey: "categoryId", as: "category" });
db.Category.hasMany(db.Expense, { foreignKey: "categoryId", as: "expenses" });

db.Category.hasMany(db.Goal, { foreignKey: "categoryId" });
db.Goal.belongsTo(db.Category, { foreignKey: "categoryId" });

export default db;

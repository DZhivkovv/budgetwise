import dbConfig from "../config/db.config.js";
import { Sequelize } from "sequelize"; 
import UserModel from "./user.model.js";
import BudgetModel from "./budget.model.js";
import CategoryModel from './category.model.js';
import ExpenseModel from './expense.model.js';

// Create a Sequelize instance using configuration from db.config.js
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,       // Database host
  dialect: dbConfig.dialect, // Database type (postgres)
  port: dbConfig.PORT,       // Database port
  pool: dbConfig.pool,       // Connection pool settings
  logging: false
});

// Create an object to hold all models and Sequelize instance
const db = {};
db.Sequelize = Sequelize;     // Save Sequelize library reference
db.sequelize = sequelize;     // Save Sequelize instance

// Initialize the User model and attach it to db object
db.User = UserModel(sequelize, Sequelize);
// Initialize the Budget model and attach it to db object
db.Budget = BudgetModel(sequelize, Sequelize);
// Initialize the Expense model and attach it to db object
db.Expense = ExpenseModel(sequelize, Sequelize);
// Initialize the Category model and attach it to db object
db.Category = CategoryModel(sequelize, Sequelize);

// Export the db object so it can be used elsewhere (controllers, routes, etc.)
export default db;

import express from 'express';
import dotenv from 'dotenv';
// Configure dotenv to read environment variables from .env file
dotenv.config();
import cors from 'cors';
import cookieParser from "cookie-parser";
import db from './models/index.js';

import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budget.js';

// Create an Express application instance
const app = express();

// Enable CORS for cross-origin requests
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true                
}));

// Middleware to parse incoming JSON request bodies
app.use(express.json());

app.use(cookieParser());

// Get the port number from environment variables
const port = process.env.PORT;

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});

// Test database connection
db.sequelize.authenticate()
.then(() => console.log("Database connected"))
.catch(err => console.error("DB connection error: ", err));

// Synchronize Sequelize models with the database
db.sequelize.sync({ alter: true })
.then(() => console.log("Models synchronized"))
.catch(err => console.error("Sync error: ", err));

// Register authentication-related routes under /auth path
app.use('/auth', authRoutes);
// Register budget-related routes under /budget path
app.use('/budget', budgetRoutes);
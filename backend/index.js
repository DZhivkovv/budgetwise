import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import db from './models/index.js';

import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budget.js';
import expenseRoutes from './routes/expense.js';
import categoryRoutes from './routes/category.js';

dotenv.config();

const app = express();

// Enable CORS for cross-origin requests
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/budget', budgetRoutes);
app.use('/expense', expenseRoutes);
app.use('/category', categoryRoutes);

// Database connection test
db.sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("DB connection error: ", err));

if (process.env.NODE_ENV !== 'test') {
  db.sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized'))
    .catch(err => console.error('Sync error:', err));
}

export default app;

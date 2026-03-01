import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./models/index.js";

import authRoutes from "./routes/auth.js";
import budgetRoutes from "./routes/budget.js";
import expenseRoutes from "./routes/expense.js";
import categoryRoutes from "./routes/category.js";
import goalRoutes from "./routes/goal.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://budgetwise-sepia.vercel.app",
  "https://budgetwise-ikuk43rch-dzhivkovvs-projects.vercel.app",
];

// Enable CORS for cross-origin requests
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server requests or Postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/budget", budgetRoutes);
app.use("/expense", expenseRoutes);
app.use("/category", categoryRoutes);
app.use("/goal", goalRoutes);

// Database connection test
db.sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection error: ", err));

if (process.env.NODE_ENV === "development") {
  db.sequelize.sync({ alter: true });
}

export default app;

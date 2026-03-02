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

const allowedOrigins = [process.env.CLIENT_URL];

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman/server requests
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

// Database connection
db.sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection error: ", err));

// Dev-only sync
if (process.env.NODE_ENV === "development") {
  db.sequelize
    .sync({ alter: true })
    .then(() => console.log("Database synced (dev only)"))
    .catch((err) => console.error("DB sync error: ", err));
}

export default app;

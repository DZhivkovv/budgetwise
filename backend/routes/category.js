import express from "express";

const router = express.Router();

// Import Expense model from the database
import db from "../models/index.js";
const Category = db.Category;

router.get("/", async (req, res) => {
  const categories = await Category.findAll();
  return res.status(200).json(categories);
});

export default router;

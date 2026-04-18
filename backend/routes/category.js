import express from "express";

const router = express.Router();

// Import Expense model from the database
import db from "../models/index.js";
const Category = db.Category;

router.get("/", async (req, res) => {
  const categories = await Category.findAll();
  return res.status(200).json(categories);
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    const category = await db.Category.create({ name });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating category" });
  }
});

export default router;

import express from 'express';

const router = express.Router();

// Import Expense model from the database
import db from "../models/index.js";
const Category = db.Category;


router.get('/', async (req, res) => {
    const categories = await Category.findAll();
    return res.status(200).json(categories);
});


// POST заявка към "/"
router.post('/', async (req, res) => {
  try {
    const {name} = req.body;

    await Category.create({name});
        
    // Връщаш отговор към клиента
    res.status(200).json({ success: true, message: "Данните са получени!" });
  } catch (error) {
    // Грешки се хващат тук
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

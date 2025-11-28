import express from 'express';

import { addUserExpense, editUserExpense, deleteUserExpense, deleteAllExpenses } from '../controllers/expense.js';
import db from '../models/index.js';

const router = express.Router();

// Add user expense route: handles POST requests to /expense
router.post('/', addUserExpense);
// Edit user expense route: handles PATCH requests to /expense
router.patch('/', editUserExpense);
// Delete user expense route: handles DELETE requests to /expense
router.delete('/', deleteUserExpense);

router.get('/', async(req, res) => {
    const expenses = await db.Expense.findAll({where: {}});
    return res.status(200).json({expenses});
})

router.delete('/all', deleteAllExpenses)
export default router;


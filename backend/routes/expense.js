import express from 'express';
import { getAllUserExpenses, addUserExpense, editUserExpense, deleteUserExpense, deleteAllExpenses } from '../controllers/expense.js';

const router = express.Router();

// Get all user expenses route: handles GET requests to /expense
router.get('/', getAllUserExpenses)
// Add user expense route: handles POST requests to /expense
router.post('/', addUserExpense);
// Edit user expense route: handles PATCH requests to /expense
router.patch('/', editUserExpense);
// Delete user expense route: handles DELETE requests to /expense
router.delete('/', deleteUserExpense);

router.delete('/all', deleteAllExpenses)

export default router;


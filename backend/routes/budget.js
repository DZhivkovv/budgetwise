import express from 'express';

import { checkIfUserHasBudget, addUserBudget, getAllBudgets, editUserBudget } from '../controllers/budget.js';

const router = express.Router();

// User budget route: handles GET requests to /budget
router.get('/', checkIfUserHasBudget);
// Add user budget route: handles POST requests to /budget
router.post('/', addUserBudget);
// Edit user budget route: handles PATCH requests to /budget
router.patch('/', editUserBudget);

// Add user budget route: handles GET requests to /budget/add
// router.get('/getAll', getAllBudgets);

export default router;
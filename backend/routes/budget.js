import express from 'express';

import { checkIfUserHasBudget, addUserBudget, getAllBudgets, editUserBudget, deleteAllBudgets } from '../controllers/budget.js';

const router = express.Router();

// User budget route: handles GET requests to /budget
router.get('/', checkIfUserHasBudget);
// Add user budget route: handles POST requests to /budget
router.post('/', addUserBudget);
// Edit user budget route: handles PATCH requests to /budget
router.patch('/', editUserBudget);

// router.get('/getAll', getAllBudgets);
// router.get('/delete', deleteAllBudgets);


export default router;